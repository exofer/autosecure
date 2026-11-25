const fetch = require('node-fetch')

async function getNAME(uuid) {
  uuid = uuid.replace(/-/g, '') // Clean UUID format



  let name = await method1(uuid)
  if (name) return name

  name = await method2(uuid)
  if (name) return name

  name = await method3(uuid)
  if (name) return name

  return null
}


  async function method1(uuid) {
    const res = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`)
    if (!res.ok) return null
    const data = await res.json()
    return data?.name || null
  }

  async function method2(uuid) {
    const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.name || null
  }

  async function method3(uuid) {
    const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${uuid}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.username || null
  }

  module.exports = {
    getNAME
  }
