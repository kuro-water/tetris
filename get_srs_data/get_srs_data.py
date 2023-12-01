import requests
from bs4 import BeautifulSoup as bs
import json

data: str
# res = requests.get(url="https://tetris.fandom.com/wiki/SRS")
# .htmlは↑のリンクから該当の表のhtmlだけコピペしてきたもの。
with open(".\\get_srs_data\\I.html", mode="r") as f:
    data = f.read()

html = bs(data, "html.parser")


datas = [[]]
tts = html.find_all("tt")
i = 0
cnt = 0
for tt in tts:
    if cnt == 4:
        datas.append([])
        i += 1
        cnt = 0
    string: str = tt.get_text()
    x = string.split(sep=",")

    datas[i].append(tt.get_text())
    cnt += 1

with open("./get_srs_data/str_I.json", mode="w", encoding="utf-8") as f:
    f.write(json.dumps(datas))
