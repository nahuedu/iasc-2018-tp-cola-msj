#!/bin/bash
if [ -z "$1" ]; then
	echo "Uso $0
Ejemplo: 

Argumentos
	desde 						Desde numero enviado
	hasta 						Hasta numero enviado
	topic            			Topic de la lista a enviar"
	exit;
fi
if [ -z "$2" ]; then
	echo "Falta HASTA"
	exit;
fi
if [ -z "$3" ]; then
	echo "Falta topic"
	exit;
fi

DESDE=$1
HASTA=$2
TOPIC=$3

while [ $HASTA -ge $DESDE ]; do

  sh -c "curl -X POST \
  http://localhost:9000/send \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
	\"msg\": {\"data\":\"Mensaje numero $DESDE\"},
	\"topic\": \"$TOPIC\"
}
';echo -n;"
  ((DESDE++))
done
