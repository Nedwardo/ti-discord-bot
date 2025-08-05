async function get_username_from_id(id: string) : Promise<string>{
    const url = "https://discordlookup.mesalytic.moe/v1/user/"

    return fetch(url + id).then(
        response => {
            try{
                const username = response.json().then(json_response => {
                    return Object.keys(json_response).includes("username") ? json_response.username as string : id
                })
                return username
            } catch{
                return id
            }
        })
}

export default get_username_from_id