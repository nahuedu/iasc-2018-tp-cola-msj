# Trabajo Practico Cola de Mensajes Distribuida
*Implementacion de Arquitecturas Concurrentes UTN FRBA*

*2do Cuatrimestre 2018*

Integrantes |
----------- |
Federico Maidan |
Mario Llanos |
Nahuel Andreoli |
Pablo Di Risio |
Santiago Garcia |


- [Enunciado](https://docs.google.com/document/d/18UB4slfDrlvhyx57nHtLp1LkfNOenajvnI_Jm06BaCE/edit)
- [Arquitectura](https://docs.google.com/document/d/1GS7BGE-P46VPbF90aM__Ry0TZEZ2GpYBElyf6C0-PsE/edit)
- [Pruebas](https://docs.google.com/spreadsheets/d/1lc-wmgsVEmkH3n0Lf1c8LDcxFozOy4T2UPquCdmoWIM/edit)

<div class="postman-run-button"
data-postman-action="collection/import"
data-postman-var-1="9c3bc76c68f3ee096368"></div>
<script type="text/javascript">
  (function (p,o,s,t,m,a,n) {
    !p[s] && (p[s] = function () { (p[t] || (p[t] = [])).push(arguments); });
    !o.getElementById(s+t) && o.getElementsByTagName("head")[0].appendChild((
      (n = o.createElement("script")),
      (n.id = s+t), (n.async = 1), (n.src = m), n
    ));
  }(window, document, "_pm", "PostmanRunObject", "https://run.pstmn.io/button.js"));
</script>

## Run
```
npm start
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
