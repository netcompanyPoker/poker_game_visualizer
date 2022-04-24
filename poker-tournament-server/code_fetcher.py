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
    'connect.sid': 's%3A7w6W2RmO7h_6aDhPcp-37dKFI5r_x_Ff.ZWFGdBid3GgFCe9n5go8jJ94GiOgJJ3CipSQQecsjxQ',
    'amplitudeSessionId': '1649489862',
    '_dd_s': 'logs=1&id=0edece00-f58f-4806-a0be-a967ef972090&created=1649489862645&expire=1649491263939&rum=1',
    '__stripe_mid': '56576eab-a86b-4575-8980-1b01f9173b0391f4f3',
    '__stripe_sid': '341178c1-ef54-449a-a695-7eaa30226db57f40c4',
    'replit:authed': '1',
    'replit_authed': '1',
    'sidebarClosed': 'true',
    'replit_ng': '1649490940.821.1666.704228|8035451343a2d8f3e54599c71b2aec19',
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
    # 'Cookie': 'connect.sid=s%3A7w6W2RmO7h_6aDhPcp-37dKFI5r_x_Ff.ZWFGdBid3GgFCe9n5go8jJ94GiOgJJ3CipSQQecsjxQ; amplitudeSessionId=1649489862; _dd_s=logs=1&id=0edece00-f58f-4806-a0be-a967ef972090&created=1649489862645&expire=1649491263939&rum=1; __stripe_mid=56576eab-a86b-4575-8980-1b01f9173b0391f4f3; __stripe_sid=341178c1-ef54-449a-a695-7eaa30226db57f40c4; replit:authed=1; replit_authed=1; sidebarClosed=true; replit_ng=1649490940.821.1666.704228|8035451343a2d8f3e54599c71b2aec19',
}


def get_all_bots():
    now = datetime.now()
    timestamp = f'{now.strftime("%Y%m%d-%H%M%S")}'

    with open('bots.csv', 'r', encoding="utf-8") as f:
        bots_csv = f.readlines()

    for bot in bots_csv:
        player_name, bot_location, table = bot.split(";")
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
