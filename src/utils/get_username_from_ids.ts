async function get_username_from_id(id: string) : Promise<string>{
    const url = "https://discordlookup.mesalytic.moe/v1/user/"

    return fetch(url + id).then(
        response => {
            try{
                const username = response.json().then(json_response => json_response.get("username", id))
                return username
            } catch{
                return id
            }
        })
}

export default get_username_from_id