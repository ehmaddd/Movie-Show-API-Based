/* eslint-disable no-console */
import './index.css';
import commentCounter from './comment-counter.js';
import itemCounter from './item-counter.js';

let season;
let number;

const getMovies = async () => {
  const response = await fetch(' https://api.tvmaze.com/seasons/1/episodes');
  const data = response.json();
  return data;
};

const getLike = async () => {
  const response = await fetch(
    'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/3CLv413c1ifs1Ya2iHvU/likes/',
  );
  const data = await response.json();
  return data;
};

const postLike = async (id) => {
  // eslint-disable-next-line no-unused-vars
  const response = await fetch(
    'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/3CLv413c1ifs1Ya2iHvU/likes/',
    {
      method: 'POST',
      body: JSON.stringify({
        item_id: id,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    },
  );
};

const likes = await getLike();
const displayLike = (id) => likes[id].likes;

const data = await getMovies();
const list = document.querySelector('.list');

let count = 1;
data.forEach((item) => {
  if (item.image) {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = item.image.medium;
    img.alt = `${item.name}`;

    const div = document.createElement('div');
    div.classList.add('row');
    div.innerHTML = `<h2>${
      item.name
    }<h2/> <svg class='my-svg' id="${count}" xmlns='http://www.w3.org/2000/svg' height='48' viewBox='0 96 960 960' width='48'><path d='m480 935-41-37q-105.768-97.121-174.884-167.561Q195 660 154 604.5T96.5 504Q80 459 80 413q0-90.155 60.5-150.577Q201 202 290 202q57 0 105.5 27t84.5 78q42-54 89-79.5T670 202q89 0 149.5 60.423Q880 322.845 880 413q0 46-16.5 91T806 604.5Q765 660 695.884 730.439 626.768 800.879 521 898l-41 37Zm0-79q101.236-92.995 166.618-159.498Q712 630 750.5 580t54-89.135q15.5-39.136 15.5-77.72Q820 347 778 304.5T670.225 262q-51.524 0-95.375 31.5Q531 325 504 382h-49q-26-56-69.85-88-43.851-32-95.375-32Q224 262 182 304.5t-42 108.816Q140 452 155.5 491.5t54 90Q248 632 314 698t166 158Zm0-297Z'/></svg><div class="likes-count">${displayLike(
      count,
    )} Likes</div> </div>`;

    const btn = document.createElement('button');
    btn.classList.add('comment-button');
    btn.id = count;
    btn.innerText = 'Comments';

    li.append(img);
    li.append(div);
    li.append(btn);

    list.appendChild(li);
    count += 1;
  }
});

const svgs = document.querySelectorAll('.my-svg');

svgs.forEach((svg) => {
  const postId = parseInt(svg.id, 10) + 1;
  const id = parseInt(svg.id, 10);
  let isLiked = localStorage.getItem(`post_${postId}_isLiked`) === 'true';
  svg.classList.toggle('active', isLiked);

  svg.addEventListener('click', async () => {
    isLiked = !isLiked;
    svg.classList.toggle('active', isLiked);
    localStorage.setItem(`post_${postId}_isLiked`, isLiked.toString());

    // send request to server
    if (isLiked) {
      await postLike(postId.toString());
      document.location.reload();
    } else {
      const courrentLike = likes[id].likes;
      const newLike = courrentLike - 1;
      // eslint-disable-next-line no-unused-vars
      const response = await fetch(
        `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/3CLv413c1ifs1Ya2iHvU/likes?item_id=${svg.id}&likes=${newLike}`,
        {
          method: 'PATCH',
        },
      ).then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
      // document.location.reload();
    }

    // don't reload the page after click
  });
});

const getSingle = async (id) => {
  const response = await fetch(
    `https://api.tvmaze.com/shows/1/episodebynumber?season=1&number=${id}`,
  );
  const data = await response.json();
  return data;
};

const modal = document.getElementById('myModal');
const contModal = document.querySelector('.modal-flex');
const imgPlace = document.querySelector('.modal-content img');

const showComments = async (season, number) => {
  const ul = document.querySelector('.det-item');
  const counter = document.querySelector('.com-count');
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
  const showComm = await fetch(
    `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/be9WLm2cUd5ClZDWcc7I/comments?item_id=${season}-${number}`,
  );
  const data = await showComm.json();
  try {
    data.forEach((comment) => {
      const li = document.createElement('li');
      li.innerText = `${comment.creation_date} - ${comment.username} : ${comment.comment}`;
      ul.appendChild(li);
    });
    counter.innerHTML = commentCounter(ul);
    document.querySelector('.com-det').appendChild(ul);
  } catch {
    const ul = document.querySelector('.det-item');
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    const li = document.createElement('li');
    li.textContent = 'No Comment Found';
    li.classList.add('com-li');
    ul.appendChild(li);
    counter.innerHTML = commentCounter(null);
  }
};

list.addEventListener('click', async (ev) => {
  if (ev.target.localName === 'button') {
    while (contModal.firstChild) {
      contModal.removeChild(contModal.firstChild);
    }
    const data = await getSingle(ev.target.id);
    modal.style.display = 'block';
    const img = data.image.medium;
    imgPlace.src = img;

    season = data.season;
    number = data.number;

    const { name, type } = data;

    const rating = data.rating.average;

    const nm = document.querySelector('.modal-content h2');
    nm.innerHTML = `${name}`;

    const seasonP = document.createElement('p');
    seasonP.innerHTML = `Season - ${season}`;

    const episodeP = document.createElement('p');
    episodeP.innerHTML = `Episode - ${number}`;

    const typeP = document.createElement('p');
    typeP.innerHTML = `Type - ${type}`;

    const ratingP = document.createElement('p');
    ratingP.innerHTML = `Rating - ${rating}`;

    contModal.appendChild(seasonP);
    contModal.appendChild(episodeP);
    contModal.appendChild(typeP);
    contModal.appendChild(ratingP);
  }
  localStorage.clear();
  const sea = parseInt(season, 10);
  const num = parseInt(number, 10);

  const id = `${sea}-${num}`;
  localStorage.setItem('item', id);
  showComments(season, number);
});

const span = document.getElementsByClassName('close')[0];
span.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

const form = document.querySelector('#comment-form');
const button = document.querySelector('#comment-form button');

form.addEventListener('click', (ev) => {
  ev.preventDefault();
  if (ev.target.localName === 'button') {
    const item = `${season}-${number}`;
    const user = document.querySelector('#comment-form #user-name').value;
    const commentText = document.querySelector('#comment-form #comment').value;
    const commentObj = {
      item_id: item,
      username: user,
      comment: commentText,
    };
    fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/be9WLm2cUd5ClZDWcc7I/comments', {
      method: 'POST',
      body: JSON.stringify(commentObj),
      headers: {
        'Content-type': 'application/json',
      },
    }).then((response) => {
      if (response.ok) {
        return response;
      }
      return Promise.reject(response);
    }).then(() => {
      button.innerText = 'Successfully added';
      form.reset();
      setTimeout(() => {
        button.innerText = 'Add Comment';
      }, 3000);
      showComments(season, number);
    }).catch(() => {
      form.reset();
      setTimeout(() => {
        button.innerText = 'Add Comment';
      }, 3000);
      button.innerText = 'Something went wrong.';
    });
  }
});
itemCounter();
