let FS = require('fs');

// Read command line arguments & assign defaults

let inputTweetTextFilePath = process.argv[2];
let outputFirstWordProbabilityFilePath = process.argv[3];
let outputTransitionMatrixFilePath = process.argv[4];

if (inputTweetTextFilePath === undefined) {
  inputTweetTextFilePath = './resources/trump2016tweets.txt';
}

if (outputFirstWordProbabilityFilePath === undefined) {
  outputFirstWordProbabilityFilePath = './output/markovTransition.json';
}

if (outputTransitionMatrixFilePath === undefined) {
  outputTransitionMatrixFilePath = './output/tweetFirstWordsProbability.json';
}

FS.readFile(inputTweetTextFilePath,'utf8', onTweetFileReadFinish);

let markovTransition = {};
let tweetFirstWordsProbability = [];

function onTweetFileReadFinish(error, tweetsFile){
  if (error) throw error;
  let tweets = tweetsFile.split('\n');

  calculateFirstWordsProbabilities(tweets);
  calculateMarkovTransitions(tweets);

  //console.log(markovTransition);
  //console.log(tweetFirstWordsProbability);

  generateTweet();
  // generateTweet();
  // generateTweet();
  // generateTweet();
  // generateTweet();
  // generateTweet();
  // generateTweet();
  // generateTweet();
  FS.writeFile(outputTransitionMatrixFilePath, JSON.stringify(markovTransition));
  FS.writeFile(outputFirstWordProbabilityFilePath, JSON.stringify(tweetFirstWordsProbability));
}

function calculateFirstWordsProbabilities(tweets)
{
  let tweetFirstWords = [];
  tweets.forEach(extractFirstWordofTweet);
  tweetFirstWordsProbability = convertToProbabilityArray(tweetFirstWords);

  function extractFirstWordofTweet(tweet) {
    let words = tweet.split(' ');
    tweetFirstWords.push(words[0]);
  }  
}

function calculateMarkovTransitions(tweets)
{
  tweets.forEach(populateMarkovFrequencies);
  processMarkovTransition();

  function populateMarkovFrequencies(tweet) {
    let words = tweet.split(' ');

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      let isLastWordinTweet = (i === (words.length - 1));

      if (markovTransition[word] === undefined) {
        markovTransition[word] = [];
      }

      if (isLastWordinTweet) {
        markovTransition[word].push('\n');
      } else {
        let nextWordInTweet = words[i+1];
        markovTransition[word].push(nextWordInTweet); 
      }
    }
  }

  function processMarkovTransition() {
    for (let word in markovTransition) {
      markovTransition[word] = convertToProbabilityArray(markovTransition[word]);
    }
  }
}

function convertToProbabilityArray(wordsArray) {
  let wordsFrequency = {};
  let wordsProbability = [];
  let totalWordsSampleSize = wordsArray.length;

  wordsArray.forEach(function(word) {
    if (wordsFrequency[word] === undefined) {
      wordsFrequency[word] = 1;
    } else {
      wordsFrequency[word]++;
    }
  });

  for (let word in wordsFrequency) {
    let wordProbability = wordsFrequency[word] / totalWordsSampleSize;
    wordsProbability.push([word, wordProbability]);
  }

  return wordsProbability;
}

function generateTweet() {
  let tweetWordArray = [];
  let generatedTweet = '';

  let randomTweetStaringWord = getNextWord(tweetFirstWordsProbability);
  tweetWordArray.push(randomTweetStaringWord);

  for (let i = 1; i < 200; i++)
  {
    let lastWord = tweetWordArray[i - 1];
    let nextWord = getNextWord(markovTransition[lastWord]);

    if ((nextWord) !== '\n') {
      tweetWordArray.push(nextWord);      
    } else {
      break;
    }
  }

  generatedTweet = tweetWordArray.join(' ');
  console.log(generatedTweet);
}

function getNextWord(wordTransitionArray) {
  let randomNumber = Math.random();
  let accumulatedProbaility = 0;
  for (let i = 0; i < wordTransitionArray.length; i++) {
    let word = wordTransitionArray[i][0];
    let wordProbability = wordTransitionArray[i][1];

    if (randomNumber < (accumulatedProbaility + wordProbability)) {
      return word;
    } else {
      accumulatedProbaility += wordProbability;
    }
  }
}

