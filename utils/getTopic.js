module.exports = (topic, topics) => {
  let topicReturn = null;
  topics.forEach((t) => {
    if (topic === t.topic)
      topicReturn = t;
  });

  return topicReturn;
};