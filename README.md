# Trabajo Practico Cola de Mensajes Distribuida
*Implementacion de Arquitecturas Concurrentes UTN FRBA*

*2do Cuatrimestre 2018*


- [Enunciado](https://docs.google.com/document/d/18UB4slfDrlvhyx57nHtLp1LkfNOenajvnI_Jm06BaCE/edit)
- [Arquitectura](https://docs.google.com/document/d/1GS7BGE-P46VPbF90aM__Ry0TZEZ2GpYBElyf6C0-PsE/edit)

## Run

node master.js

## Uso

### CREO UNA NUEVA COLA

GET http://localhost:9000/newQueue?topic=topicDeLaQueue&tipoCola=cola_de_trabajo


### GUARDO MENSAJES

GET http://localhost:9000/send?topic=topicDeLaQueue&msg=este es mi mensaje