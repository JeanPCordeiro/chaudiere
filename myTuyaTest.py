import tinytuya
import os

# Connect to Tuya Cloud
#c = tinytuya.Cloud()  # uses tinytuya.json 
#c = tinytuya.Cloud(apiRegion=os.environ['TUYA_REGION'],apiKey=os.environ['TUYA_APIKEY'],apiSecret=os.environ['TUYA_APISECRET'],apiDeviceID=os.environ['TUYA_DEVICEID'])
c = tinytuya.Cloud(apiRegion=os.environ['TUYA_REGION'],apiKey=os.environ['TUYA_APIKEY'],apiSecret=os.environ['TUYA_APISECRET'])


# Display list of devices
devices = c.getdevices()
for device in devices:
        result = c.getstatus(device['id'])
        print ("Capteur %s \tTempérature = %2.1f°C Taux Humidité = %s%% Batterie = %s" % (device['name'],(result['result'][0]['value'])/10,result['result'][1]['value'],result['result'][2]['value']))
