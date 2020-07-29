/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl } **/
async function searchShows(query) {
  //concat any titles with multiple words
  let queryArray = query.split(" ");
  let spaceJoinedQ = (queryArray.join("%20"));

  let res = await axios.get('http://api.tvmaze.com/search/shows', {params: {q: spaceJoinedQ}});
  
  let showArr = [];
  
  //creates object for necessary data about the show
  for(let i = 0; i < res.data.length; i++){
    let tempObj = {
      id: res.data[i].show.id,
      name: res.data[i].show.name,
      summary: res.data[i].show.summary,
      image: res.data[i].show.image.medium
    }
    showArr.push(tempObj);
  }
  return showArr;
}

//Given a list of shows add them to the DOM
function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let tempImg; 
    //replace with missing image if no image for the show is available
    if(show.image === ''){
      tempImg = "https://tinyurl.com/tv-missing"
    } else {
      tempImg = show.image;
    }
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
         <img class="card-img-top" src=${tempImg}>
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
           </div>
           <button id="${show.id}">Episodes</button>
         </div>
       </div>
      `);
    $showsList.append($item);
  }
}

//Show the episode area and list the episodes of a show when a button is clicked
$('#shows-list').on("click", "button", async function(e){
  e.preventDefault();
  let arrayOfInfo = await getEpisodes(e.target.id);
  populateEpisodes(arrayOfInfo);
  $("#episodes-area").show();
});

//Handle search for submission
$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);  
});


//Given a show ID, return a list of episodes: {id, name, season, number}
async function getEpisodes(id) {
  let res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  let epiArr = [];
  
  for(let i = 0; i < res.data.length; i++){
    let tempObj = {
      id: res.data[i].id,
      name: res.data[i].name,
      season: res.data[i].season,
      number: res.data[i].number
    }
    epiArr.push(tempObj);
  }
  return epiArr;
}

//Lists episodes from the show
function populateEpisodes(episodes){
  $episodesList = $('#episodes-list');

  for(let episode of episodes){
    let $newLi = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($newLi);
  }
}