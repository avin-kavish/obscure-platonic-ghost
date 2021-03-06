import formatDistanceToNow from "https://unpkg.com/date-fns@2.28.0/esm/formatDistanceToNow";
import {fetchJson} from "./utils.mjs";

const currentUser = 1

function renderComment(c, user, upvote) {
  const div = document.createElement('div')

  div.innerHTML = `
    <div class="comments__comment-container">
      <div>
        <div class="comments__avatar">
          <img class="comments__avatar-img" src="${user.avatar}" />
        </div>
      </div>
      <div class="comments__comment-content-container">
        <div class="comments__comment-header">
          <div class="comments__comment-author">
            ${user.name}
          </div>
          <div class="comments__comment-header-separator">
            ・
          </div>
          <div class="comments__comment-time">
            ${formatDistanceToNow(new Date(c.createdAt), {addSuffix: true})}
          </div>
        </div>
        <div class="comments__comment-content-body">
          ${c.body}
        </div>
        <div class="comments__comment-actions">
          <button class="button button-text upvote-button" data-comment-id="${c.id}">
            ${upvote ? `Upvoted` : `▲ Upvote`}
          </button>
          <div class="comments__comment-upvotes" data-comment-id="${c.id}" data-upvotes="${c.upvoteCount}">
            ${c.upvoteCount} upvotes
          </div>
          <!--            <button class="button button-text reply-button">-->
          <!--              Reply-->
          <!--            </button>-->
        </div>
      </div>
    </div>
  `

  return div
}

async function loadComments() {
  const {data: comments} = await fetchJson('http://localhost:3000/api/v1/comments')

  const {data: upvotes} = await fetchJson(`http://localhost:3000/api/v1/upvotes?userId=${currentUser}`)

  const params = new URLSearchParams([...comments.map(c => ['ids', c.userId]), ['ids', currentUser]])
  const {data: users} = await fetchJson(`http://localhost:3000/api/v1/users?${params}`)

  const commentContainer = document.querySelector('.comments__container')
  commentContainer.append(...comments.map(c => {
    const user = users.find(u => u.id === c.userId)
    const upvote = upvotes.find(u => u.commentId === c.id)

    return renderComment(c, user, upvote)
  }))

  function onUpvote() {
    const commentId = Number(this.dataset.commentId)
    const upvoteEl = document.querySelector(`.comments__comment-upvotes[data-comment-id="${commentId}"]`)

    const upvote = upvotes.find(u => u.commentId === commentId)
    if (!upvote) {
      const newUpvote = {userId: currentUser, commentId}
      fetchJson(`http://localhost:3000/api/v1/comments/${commentId}/upvotes`, newUpvote, 'POST')

      upvotes.push(newUpvote)

      upvoteEl.innerHTML = `${++upvoteEl.dataset.upvotes} upvotes`
      this.innerHTML = `Upvoted`
    } else {
      fetchJson(`http://localhost:3000/api/v1/comments/${commentId}/upvotes?userId=${currentUser}`, undefined, 'DELETE')

      const idx = upvotes.indexOf(upvote)
      upvotes.splice(idx, 1)

      upvoteEl.innerHTML = `${--upvoteEl.dataset.upvotes} upvotes`
      this.innerHTML = `▲ Upvote`
    }
  }

  commentContainer.querySelectorAll('.upvote-button').forEach(el => {
    el.addEventListener('click', onUpvote)
  })

  const form = document.querySelector('.comments__form')

  form.addEventListener('submit', async function (event) {
    event.preventDefault()

    const commentInput = this.elements['comment']

    const {data} = await fetchJson(`http://localhost:3000/api/v1/comments`, {
      body: commentInput.value,
      userId: currentUser
    }, 'POST')

    const user = users.find(u => u.id === currentUser)

    const container = document.querySelector('.comments__container')
    const comment = renderComment(data, user)
    container.append(comment)

    comment.querySelector('.upvote-button').addEventListener('click', onUpvote)

    commentInput.value = ''
  })
}

loadComments()
