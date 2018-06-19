import Transport from 'winston-transport'

export default class DbTrabsport extends Transport {
  constructor(opts) {
    super(opts)

    // console.log('OPTIONS', opts)
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    // console.log('INFO', arguments)

    callback()
  }
}
