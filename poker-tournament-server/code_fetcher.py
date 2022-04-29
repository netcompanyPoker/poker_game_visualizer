# Strategy:
# - Authenticate with replit (just copy token from browser when needed?)
# - Download zip
# - Unpack zip (in code?)
# - Put files in folder

import requests
import io
import zipfile
from datetime import datetime


cookies = {
    '__stripe_mid': 'bc768899-ffee-473d-8fc0-a0981205f8a596a0ec',
    'connect.sid': 's%3A8AIdeyIJV_jxyybEp3CPHuMBxjmUp5S0.44uC6m7lYwdP%2BgEmbU3MIdK2wjveEgLeJAyfMdsledQ',
    'ajs_anonymous_id': '86aecb02-045a-4d82-83ef-68640bcb7052',
    'ajs_user_id': '12607051',
    'replit:authed': '1',
    'replit_authed': '1',
    'sidebarClosed': 'true',
    'replit_ng': '1651163012.675.686.110129|8035451343a2d8f3e54599c71b2aec19',
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.7,da;q=0.3',
    # 'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Connection': 'keep-alive',
    # Requests sorts cookies= alphabetically
    # 'Cookie': '__stripe_mid=bc768899-ffee-473d-8fc0-a0981205f8a596a0ec; connect.sid=s%3A8AIdeyIJV_jxyybEp3CPHuMBxjmUp5S0.44uC6m7lYwdP%2BgEmbU3MIdK2wjveEgLeJAyfMdsledQ; ajs_anonymous_id=86aecb02-045a-4d82-83ef-68640bcb7052; ajs_user_id=12607051; replit:authed=1; replit_authed=1; sidebarClosed=true; replit_ng=1651163012.675.686.110129|8035451343a2d8f3e54599c71b2aec19',
}

def get_all_bots():
    now = datetime.now()
    timestamp = f'{now.strftime("%Y%m%d-%H%M%S")}'

    with open('bots.csv', 'r', encoding="utf-8") as f:
        bots_csv = f.readlines()

    for bot in bots_csv:
        player_name, bot_location, table = bot.split(";")
        bot_location = "".join(bot_location.split("_"))
        get_zip(player_name.strip(), bot_location.strip(), timestamp, table.strip())


def get_zip(player_name, bot_location, timestamp, table):
    response = requests.get(
        f'https://replit.com/{bot_location}.zip',
        headers=headers,
        cookies=cookies
    )

    if (response.status_code != 200):
        print(f"Couldn't download: {player_name}: {bot_location}")
        return

    username, reponame = bot_location.split('/')
    player_name_without_at = username.split('@')[-1]
    print(f"Downloaded table {table} '{username}' bot '{reponame}'.")

    z = zipfile.ZipFile(io.BytesIO(response.content))
    z.extractall(
        path=f'bots/{timestamp}/{table}/{player_name_without_at}-{reponame}')
    z.close()


if __name__ == '__main__':
    get_all_bots()
