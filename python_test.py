import requests
url = 'http://10.10.46.142:3001/insertdata'
#HALL_SENSOR,MSTRM_SENSOR,GSTRM_SENSOR
payload = {'userId': 'admin','password': 'admin', 'sensorId': 'GSTRM_SENSOR'}

r = requests.post(url, data=payload)
print(r.status_code)