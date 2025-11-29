const { spawn } = require('child_process'), fs = require('fs').promises, path = require('path'), os = require('os'), crypto = require('crypto');
module.exports = async (host) => {
    const pythonScript = `
import sys,json,base64,requests,re
def process_data(data):
    host=data.get('host')
    loginRedirectUrl="https://sisu.xboxlive.com/connect/XboxLive/?state=login&cobrandId=8058f65d-ce06-4c30-9559-473c9275a65d&tid=896928775&ru=https://www.minecraft.net/en-us/login&aid=1142970254"
    try:
        login_response=requests.get(loginRedirectUrl,allow_redirects=False)
        if login_response.status_code!=302:return {"error":"Initial login redirect did not return a 302 status."}
        location=login_response.headers.get('Location')
        if not location:return {"error":"No location header found after first redirect."}
        cookie=f"__Host-MSAAUTH={host}"
        accessTokenRedirect=requests.get(location,headers={"Cookie":cookie},allow_redirects=False)
        if accessTokenRedirect.status_code!=302:return {"error":"Second access token redirect did not return a 302 status."}
        location=accessTokenRedirect.headers.get('Location')
        if not location:return {"error":"No location header found for final redirect."}
        accessTokenRedirect=requests.get(location,allow_redirects=False)
        if accessTokenRedirect.status_code!=302:return {"error":"Third access token redirect did not return a 302 status."}
        location=accessTokenRedirect.headers.get('Location')
        if not location:return {"error":"No location header found after second access token redirect."}
        match=re.search(r'accessToken=([A-Za-z0-9\\-_]+)',location)
        if not match:return {"error":"Access token not found in location URL."}
        accessToken=match.group(1)+"="*((4-len(match.group(1))%4)%4)
        try:
            decoded_data=base64.b64decode(accessToken).decode('utf-8')
            json_data=json.loads(decoded_data)
        except Exception as e:
            return {"error":f"Error decoding access token: {e}"}
        uhs=json_data[0].get('Item2',{}).get('DisplayClaims',{}).get('xui',[{}])[0].get('uhs')
        if not uhs:return {"error":"Failed to extract 'uhs' from access token."}
        xsts=""
        for item in json_data:
            if item.get('Item1')=="rp://api.minecraftservices.com/":
                xsts=item.get('Item2',{}).get('Token','')
                break
        if not xsts:return {"error":"Failed to extract 'xsts' token."}
        return {'xbl':f"XBL3.0 x={uhs};{xsts}"}
    except Exception as e:
        return {"error":f"Error processing data: {e}"}
if __name__=="__main__":
    try:
        data=json.loads(sys.stdin.read())
        print(json.dumps(process_data(data)))
    except Exception as e:
        print(json.dumps({"error":f"Failed to execute Python script: {e}"}))
    `;
    const tempDir = os.tmpdir(),
        tempFileName = `getxbl_${crypto.randomBytes(16).toString('hex')}.py`,
        tempFilePath = path.join(tempDir, tempFileName);
    try {
        await fs.writeFile(tempFilePath, pythonScript, 'utf8');
        const pythonExecutables = ['python', 'python3'];
        let pythonCmd = null;
        for (const cmd of pythonExecutables) {
            try {
                await new Promise((resolve, reject) => {
                    const check = spawn(cmd, ['--version']);
                    check.on('close', (code) => (code === 0 ? resolve() : reject()));
                    check.on('error', reject);
                });
                pythonCmd = cmd;
                break;
            } catch {}
        }
        if (!pythonCmd) throw new Error("Python is not installed or not found in PATH.");
        const pythonProcess = spawn(pythonCmd, [tempFilePath]),
            data = { host };
        pythonProcess.stdin.write(JSON.stringify(data)), pythonProcess.stdin.end();
        let result = '', errorOutput = '';
        pythonProcess.stdout.on('data', d => result += d.toString()), pythonProcess.stderr.on('data', d => errorOutput += d.toString());
        const exitCode = await new Promise((resolve, reject) => {
            pythonProcess.on('close', resolve);
            pythonProcess.on('error', reject);
        });
        await fs.unlink(tempFilePath);
        if (exitCode === 0) {
            try {
                const parsedResult = JSON.parse(result.trim());
                if (parsedResult && parsedResult.xbl) return parsedResult;
                if (parsedResult && parsedResult.error) {
                    return null;
                }
                return null;
            } catch (error) {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        try { await fs.unlink(tempFilePath); } catch {}
        return null;
    }
};
