module.exports = (title, description, fields, color, author) => {
  return {
    type: "rich",
    title: title,
    description: description,
    fields: fields,
    timestamp: new Date(),
    color: color || 0xF59E0B,
    footer: { text: "Nova Autosecure" },
    author: author
  }
}
