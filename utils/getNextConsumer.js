function getNextConsumer(consumers, consumerId){
    
    for (let i = 0; i < consumers.length; i++) {
        if(consumers[i].id == consumerId)
        {
            if(i == consumers.length - 1)
                return consumers[0]
            else
                return consumers[i+1]
        }
    }

}

module.exports = getNextConsumer;