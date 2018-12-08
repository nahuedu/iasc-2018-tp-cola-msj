function getPreviousConsumer(consumers, consumerId){
    
    for (let i = 0; i < consumers.length; i++) {
        
        if(consumers[i].id == consumerId)
        {
            if(i == 0)
                return consumers[consumers.length-1]
            else
                return consumers[i-1]
        }
    }

}

module.exports = getPreviousConsumer;