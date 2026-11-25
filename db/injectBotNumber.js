const { tablesbotnumber } = require("./gettablesarray");

/**
 * Counts unquoted '?' SQL parameter placeholders in a SQL slice.
 * @param {string} sql
 * @returns {number}
 */
function countPlaceholders(sql) {
  let count = 0;
  let quote = null;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (quote) {
      if (ch === quote && sql[i - 1] !== "\\") {
        quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
    } else if (ch === "?") {
      count++;
    }
  }
  return count;
}

/**
 * Finds the start index of the first top-level SQL keyword match (outside quotes & parens).
 * @param {string} sql
 * @param {RegExp} regex - Sticky/global-less regex anchored to match at current index (e.g. /^(WHERE)\b/i)
 * @param {number} [startPos=0]
 * @returns {number} Index in sql or -1
 */
function findTopLevelKeyword(sql, regex, startPos = 0) {
  let depth = 0;
  let quote = null;
  for (let i = startPos; i < sql.length; i++) {
    const ch = sql[i];
    if (quote) {
      if (ch === quote && sql[i - 1] !== "\\") {
        quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === "(") {
      depth++;
      continue;
    }
    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) {
      const prev = i === 0 ? " " : sql[i - 1];
      if (!/[A-Za-z0-9_]/.test(prev) && regex.test(sql.slice(i))) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Extracts the closing index of a balanced parenthesized group starting at openIdx.
 * @param {string} sql
 * @param {number} openIdx
 * @returns {number}
 */
function findClosingParen(sql, openIdx) {
  let depth = 0;
  let quote = null;
  for (let i = openIdx; i < sql.length; i++) {
    const ch = sql[i];
    if (quote) {
      if (ch === quote && sql[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Safely scopes SQL queries on bot-isolated tables to a specific botnumber,
 * preserving operator precedence (wrapping OR conditions) and clause ordering
 * (WHERE before GROUP BY / HAVING / ORDER BY / LIMIT / OFFSET).
 *
 * @param {string} query
 * @param {Array} [params=[]]
 * @param {number|string} botnumber
 * @param {string[]} [allowedTables=tablesbotnumber()]
 * @returns {{ query: string, params: Array }}
 */
function injectBotNumber(query, params = [], botnumber, allowedTables = tablesbotnumber()) {
  const safeParams = Array.isArray(params) ? [...params] : [];
  if (typeof query !== "string" || botnumber === undefined || botnumber === null) {
    return { query, params: safeParams };
  }

  const trimmed = query.trim();
  const cmdMatch = trimmed.match(/^(SELECT|INSERT|UPDATE|DELETE)\b/i);
  if (!cmdMatch) {
    return { query, params: safeParams };
  }
  const command = cmdMatch[1].toUpperCase();

  let table = null;
  if (command === "SELECT" || command === "DELETE") {
    const fromIdx = findTopLevelKeyword(query, /^FROM\b/i);
    if (fromIdx !== -1) {
      const m = query.slice(fromIdx).match(/^FROM\s+([`"\[\]A-Za-z0-9_]+)/i);
      table = m ? m[1].replace(/[`"'[\]]/g, "") : null;
    }
  } else if (command === "UPDATE") {
    const m = trimmed.match(/^UPDATE\s+(?:OR\s+\w+\s+)?([`"\[\]A-Za-z0-9_]+)/i);
    table = m ? m[1].replace(/[`"'[\]]/g, "") : null;
  } else if (command === "INSERT") {
    const m = trimmed.match(/^INSERT\s+(?:OR\s+\w+\s+)?INTO\s+([`"\[\]A-Za-z0-9_]+)/i);
    table = m ? m[1].replace(/[`"'[\]]/g, "") : null;
  }

  if (!table || !allowedTables.includes(table)) {
    return { query, params: safeParams };
  }

  if (command === "INSERT") {
    const valuesIdx = findTopLevelKeyword(query, /^VALUES\b/i);
    if (valuesIdx === -1) return { query, params: safeParams };

    const colOpenIdx = query.indexOf("(");
    if (colOpenIdx === -1 || colOpenIdx > valuesIdx) return { query, params: safeParams };
    const colCloseIdx = findClosingParen(query, colOpenIdx);
    if (colCloseIdx === -1 || colCloseIdx > valuesIdx) return { query, params: safeParams };

    const colsContent = query.slice(colOpenIdx + 1, colCloseIdx);
    if (/\bbotnumber\b/i.test(colsContent)) {
      return { query, params: safeParams };
    }

    const valOpenIdx = query.indexOf("(", valuesIdx);
    if (valOpenIdx === -1) return { query, params: safeParams };
    const valCloseIdx = findClosingParen(query, valOpenIdx);
    if (valCloseIdx === -1) return { query, params: safeParams };

    const paramOffset = countPlaceholders(query.slice(0, valCloseIdx));
    safeParams.splice(paramOffset, 0, botnumber);

    const newQuery =
      query.slice(0, colCloseIdx) +
      ", botnumber" +
      query.slice(colCloseIdx, valCloseIdx) +
      ", ?" +
      query.slice(valCloseIdx);

    return { query: newQuery, params: safeParams };
  }

  // SELECT, UPDATE, DELETE
  const whereIdx = findTopLevelKeyword(query, /^WHERE\b/i);
  const trailingRegex = /^(GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|OFFSET)\b/i;

  if (whereIdx !== -1) {
    const afterWhereStart = whereIdx + 5;
    const trailingIdx = findTopLevelKeyword(query, trailingRegex, afterWhereStart);
    const semiIdx = query.indexOf(";", afterWhereStart);
    const endIdx =
      trailingIdx !== -1 && (semiIdx === -1 || trailingIdx < semiIdx)
        ? trailingIdx
        : semiIdx !== -1
          ? semiIdx
          : query.length;

    const whereCond = query.slice(afterWhereStart, endIdx);
    if (/\bbotnumber\s*(=|!=|<>|IS\b|IN\b)/i.test(whereCond)) {
      return { query, params: safeParams };
    }

    const paramOffset = countPlaceholders(query.slice(0, whereIdx));
    safeParams.splice(paramOffset, 0, botnumber);

    const cleanCond = whereCond.trim();
    const newQuery =
      query.slice(0, afterWhereStart) +
      ` botnumber = ? AND (${cleanCond})` +
      (endIdx < query.length ? " " + query.slice(endIdx).trimStart() : "");

    return { query: newQuery, params: safeParams };
  }

  // No WHERE clause: insert WHERE botnumber = ? before GROUP BY / HAVING / ORDER BY / LIMIT / OFFSET
  const trailingIdx = findTopLevelKeyword(query, trailingRegex, 0);
  const semiIdx = query.indexOf(";");
  const insertPos =
    trailingIdx !== -1 && (semiIdx === -1 || trailingIdx < semiIdx)
      ? trailingIdx
      : semiIdx !== -1
        ? semiIdx
        : query.length;

  const paramOffset = countPlaceholders(query.slice(0, insertPos));
  safeParams.splice(paramOffset, 0, botnumber);

  const prefix = query.slice(0, insertPos).trimEnd();
  const suffix = query.slice(insertPos).trimStart();
  const newQuery = suffix
    ? `${prefix} WHERE botnumber = ? ${suffix}`
    : `${prefix} WHERE botnumber = ?`;

  return { query: newQuery, params: safeParams };
}

module.exports = { injectBotNumber, countPlaceholders };
