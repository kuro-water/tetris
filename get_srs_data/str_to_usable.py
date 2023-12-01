import json

with open("./get_srs_data/str_I.json", mode="r") as f:
    data = json.load(f)

# print(data)
xy = []

for i in range(len(data)):
    xy.append([])
    for j in range(len(data[i])):
        tx, ty = data[i][j].split(",")
        g, tx = tx.split("(")
        ty, g = ty.split(")")
        xy[i].append([int(tx), int(ty) * -1])
# print(xy)
srs_data = [
    [
        [],
        xy[0],
        [],
        xy[7],
    ],
    [
        xy[1],
        [],
        xy[2],
        [],
    ],
    [
        [],
        xy[3],
        [],
        xy[4],
    ],
    [
        xy[6],
        [],
        xy[5],
        [],
    ],
]
with open("./get_srs_data/SRS_I.json", mode="w") as f:
    f.write(json.dumps(srs_data))
