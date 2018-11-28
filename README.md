# Trabajo Practico Cola de Mensajes Distribuida
*Implementacion de Arquitecturas Concurrentes UTN FRBA*

*2do Cuatrimestre 2018*


- [Enunciado](https://docs.google.com/document/d/18UB4slfDrlvhyx57nHtLp1LkfNOenajvnI_Jm06BaCE/edit)
- [Arquitectura](https://docs.google.com/document/d/1GS7BGE-P46VPbF90aM__Ry0TZEZ2GpYBElyf6C0-PsE/edit)

## Run
```
node master.js
```
> Si es la primera vez que lo corren no olvidarse de instalar las dependencias antes con un ```npm install```
## Uso

### CREO UNA NUEVA COLA

POST http://localhost:9000/queue
```
{
	"topic":"topic_1",
	"tipoCola":"cola_de_trabajo"
}
```

### GUARDO MENSAJES

POST http://localhost:9000/send
```
{
	"msg": {"data":"datadatadata"},
	"topic": "topic_1"
}
```


### CONECTO CONSUMIDOR
```
export TOPIC=topic_1
export MASTER=http://127.0.0.1:3000
node consumer.js
```
