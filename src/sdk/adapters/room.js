import _ from 'lodash'
export default class RoomAdapter {
  /**
  * Params used in this class
  * @method constructor
  * @param  {Object}    HTTPAdapter [Qiscus HTTP adapter]
  * @return {void}                Returns nothing
  */
  constructor (HTTPAdapter) {
    this.HTTPAdapter = HTTPAdapter;
    this.token       = HTTPAdapter.token;
  }

  loadRooms() {
    // return this.HTTPAdapter.get('api/v1/mobile/load_rooms?token='+this.token)
    return this.HTTPAdapter.get(`api/v1/${this.token}/rooms`, {})
    .then((res) => {
      return new Promise((resolve, reject) => {
        if(res.body.status != 200) return new Promise((resolve, reject) => reject(res));
        const data = res.body.results;
        return resolve(data);
      })
    }, (error) => {
      return new Promise((resolve, reject) => {
        return reject(error);
      });
    })
  }

  getOrCreateRoom(email) {
    return this.HTTPAdapter.post(`api/v2/mobile/get_or_create_room_with_target`, {
      token: this.token,
      "emails[]": email
    })
    .then((res) => {
      if(res.body.status != 200) return new Promise((resolve, reject) => reject(res));
      let data      = res.body.results.room;
      data.comments = _.reverse(res.body.results.comments);
      data.name     = email;
      return Promise.resolve(data);
    })
  }

  loadTopics(room_id) {
    return this.HTTPAdapter.get('api/v1/mobile/topics?token='+this.token+'&room_id='+room_id)
    .then((res) => {
      return new Promise((resolve, reject) => {
        if(res.status != 200) return new Promise((resolve, reject) => reject(res));
        const data = res.body.results;
        return resolve(data);
      })
    }, (error) => {
      return new Promise((resolve, reject) => {
        return reject(error);
      });
    })
  }

}