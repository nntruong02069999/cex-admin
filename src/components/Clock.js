import React from 'react';
import dayjs from 'dayjs';
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(localizedFormat);

const formatDate = "DD-MM-YYYY hh:mm:ss a";
export default class Clock extends React.Component {
  constructor() {
    super();
    this.state = {
      time: dayjs().format(formatDate),
      one: true,
      two: false,
      three: false,
      four: false,
      background: {
        backgroundColor: "#fa8c16".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); })
      },
      class: ''
    };
    this.clicked = this.clicked.bind(this);
  }
  componentDidMount() {
    this.clockInterval = setInterval(() => {
      if (this.state.one == true) {
        this.setState({
          time: dayjs().format(formatDate)
        });
      }
      else if (this.state.four == true) {
        this.setState({
          time: dayjs().format('LTS')
        });
      }
    }, 1000);
  }
  componentWillUnmount() {
    if (this.clockInterval)
      clearInterval(this.clockInterval);
  }
  clicked() {
    this.setState({
      background: {
        backgroundColor: "#fa8c16".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); })
      }
    });
    if (this.state.one == true) {
      this.setState({ class: 'faded' });
      setTimeout(() => {
        this.setState({
          time: dayjs().format('llll'),
          one: false,
          two: true,
          class: ''
        });
      }, 200);
    }
    else if (this.state.two == true) {
      this.setState({ class: 'faded' });
      setTimeout(() => {
        this.setState({
          time: dayjs().format('MMMM Do YY'),
          two: false,
          three: true,
          class: ''
        });
      }, 200);
    }
    else if (this.state.three == true) {
      this.setState({ class: 'faded' });
      setTimeout(() => {
        this.setState({
          time: dayjs().format('LTS'),
          three: false,
          four: true,
          class: ''
        });
      }, 200);
    }
    else if (this.state.four == true) {
      this.setState({ class: 'faded' });
      setTimeout(() => {
        this.setState({
          time: dayjs().format(formatDate),
          four: false,
          one: true,
          class: ''
        });
      }, 200);
    }
  }
  render() {
    return (
      <div id="clock" onClick={this.clicked}>
        <span className={this.state.class}>{this.state.time}</span>
      </div>
    );
  }
}
