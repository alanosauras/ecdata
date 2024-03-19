// Sort the links by the length of the text in descending order
const textLinks = [
  {
    text: "Core Sound 17",
    url: "https://bandbyachtdesigns.com/core-sound-17/"
  },
  {
      text: "Core Sound 20",
      url: "https://bandbyachtdesigns.com/core-sound-20"
    },
    {
      text: "Core Sound 17 Mark 3",
      url: "https://bandbyachtdesigns.com/cs17mk3"
    },
    {
      text: "Core Sound 20 Mark 3",
      url: "https://bandbyachtdesigns.com/cs20mk3"
    },
    {
      text: "EC-22",
      url: "https://bandbyachtdesigns.com/ec-22"
    },
  // Add more combinations here
].sort((a, b) => b.text.length - a.text.length);
