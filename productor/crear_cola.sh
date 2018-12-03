#!/bin/bash
if [ -z "$1" ]; then
	echo "Uso $0
Ejemplo: 

Argumentos
	topic 						Nombre topic 
	tipo 						cola_de_trabajo || publicar_suscribir"
	exit;
fi
if [ -z "$2" ]; then
	echo "Falta tipo"
	exit;
fi

TOPIC=$1
TIPO=$2

sh -c "curl -X POST \
  http://localhost:9000/queue \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
	\"topicTitle\":\"$TOPIC\",
	\"tipoCola\":\"$TIPO\"
}'; echo -n;"
