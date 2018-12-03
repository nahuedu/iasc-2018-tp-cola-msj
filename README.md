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

```
node cli/crear_cola.js --topic TOPIC --tipoCola [cola_de_trabajo|publicar_suscribir]
```

### GUARDO MENSAJES

```
node cli/enviar_mensajes.js --topic TOPIC --msg MSG
```


### CONECTO CONSUMIDOR
```
node cli/add_consumer.js --topic TOPIC
```
