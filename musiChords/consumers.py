from channels.generic.websocket import WebsocketConsumer

class AudioConsumer(WebsocketConsumer):
    def receive(self,bytes_data:bytes=None,text_data:str=None):
        pass
    def send(self, text_data=None, bytes_data=None, close=False):
        return super().send(text_data, bytes_data, close)