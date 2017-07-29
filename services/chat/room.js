'use strict';

const should = require('should/as-function');

class Message {
  constructor(data) {
    should.exist(data);
    should(data).be.an.Object();
    should(data.nickname).be.a.String();
    should(data.text).be.a.String();

    this.nickname = data.nickname;
    this.text = data.text;
  }
}

class MessageBuffer {
  constructor(capacity) {
    should(capacity).be.a.Number();
    should(capacity).be.greaterThan(0);

    this._capacity = capacity;
    this._buffer = [];
  }

  push(message) {
    this._buffer.push(new Message(message));

    if (this._buffer.length > this.capacity) {
      this._buffer.shift();
    }
  }

  pull(n) {
    should(n).be.a.Number();
    should(n).be.greaterThan(-1);

    if (!n) {
      return [];
    }

    const nMax = Math.min(n, this._capacity);
    return this._buffer.slice(-nMax);
  }
}

class Room {
  constructor(name, maxMessages) {
    this.name = name;
    this.msgCounter = 0;
    this.readsCounter = 0;
    this.readsPerSecond = 0;

    this._msgBuffer = new MessageBuffer(maxMessages);
    this._lastUpdateTime = Date.now();
  }

  sendMessage(message) {
    this._msgBuffer.push(message);
    this.msgCounter++;
  }

  readMessages(last) {
    this.readsCounter++;
    return this._msgBuffer.pull(this.msgCounter - last - 1);
  }

  update() {
    const now = Date.now();
    const diff = now - this._lastUpdateTime;

    this.readsPerSecond = Math.round(1000*this.readsCounter/diff);
    this.readsCounter = 0;
    this._lastUpdateTime = now;
  }
}

module.exports = Room;
