import find from 'lodash/fp/find'
import reverse from 'lodash/fp/reverse'

export default class RoomAdapter {
  /**
  * Params used in this class
  * @method constructor
  * @param  {Object}    HTTPAdapter [Qiscus HTTP adapter]
  * @return {void}                Returns nothing
  */
  constructor (HTTPAdapter) {
    this.HTTPAdapter = HTTPAdapter
    this.token = HTTPAdapter.token
  }

  getOrCreateRoom (email, options, distinctId) {
    let params = { token: this.token, emails: email }
    if (distinctId) params[distinctId] = distinctId
    if (options) params['options'] = JSON.stringify(options)

    return this.HTTPAdapter.post(`api/v2/sdk/get_or_create_room_with_target`, params)
    .then((res) => {
      if (res.body.status !== 200) return new Promise((resolve, reject) => reject(res))
      const room = res.body.results.room
      room.comments = reverse(res.body.results.comments)
      const rivalUser = find(p => p.email === email)(room.participants)
      room.name = rivalUser ? rivalUser.username : 'Room name'
      return Promise.resolve(room)
    })
  }

  createRoom (name, emails, options) {
    const body = {
      token: this.token,
      name: name,
      'participants[]': emails,
      avatar_url: options.avatarURL
    }

    return this.HTTPAdapter
      .post(`api/v2/mobile/create_room`, body)
      .then((res) => {
        if (res.body.status !== 200) return Promise.reject(res)
        const room = res.body.results.room
        room.comments = res.body.results.comments
        return Promise.resolve({
          id: room.id,
          name: room.room_name,
          lastCommentId: room.last_comment_id,
          lastCommentMessage: room.last_comment_message,
          lastTopicId: room.last_topic_id,
          avatarURL: room.avatar_url,
          options: room.options,
          participants: room.participants.map(participant => ({
            email: participant.email,
            username: participant.username,
            avatarURL: participant.avatar_url
          }))
        })
      })
      .catch(err => console.error('Error when creating room', err))
  }
}
