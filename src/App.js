import React, {Component} from 'react';
import 'react-table/react-table.css';
import {Button, ControlLabel, FormControl, FormGroup, Navbar, Table} from 'react-bootstrap'
import moment from 'moment';
import InfoComponent from './components/InfoComponent'


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKeys: '',
      startDate: moment().startOf('year').format('YYYY-MM-DD'),
      endDate: moment().endOf('year').format('YYYY-MM-DD'),
      components: []
    };
  }

  onApiKeysChange = (e) => {
    this.setState({apiKeys: e.target.value});
  };

  handleChangeStart = (e) => {
    this.setState({startDate: e.target.value});
  };

  handleChangeEnd = (e) => {
    this.setState({endDate: e.target.value});
  };

  onSubmit = (e) => {
    e.preventDefault();
    let startDate = moment(this.state.startDate).format('DD.MM.YYYY');
    let endDate = moment(this.state.endDate).format('DD.MM.YYYY');
    let apiKeys = this.state.apiKeys.split('\n');
    let components = [];
    let num = 0;
    for (let apiKey of apiKeys) {
      num++;
      components.push(
        <InfoComponent
          num={num}
          apiKey={apiKey}
          startDate={startDate}
          endDate={endDate}/>
      )
    }
    this.setState({components: components})
  };

  render() {
    return (
      <div>
        <Navbar fixedTop>
          <Navbar.Form inline>
            <FormGroup>
              <ControlLabel>Период с:</ControlLabel>
              {' '}
              <FormControl
                name="startDate"
                type="date"
                value={this.state.startDate}
                onChange={this.handleChangeStart}/>
            </FormGroup>
            {' '}
            <FormGroup>
              <ControlLabel>по:</ControlLabel>
              {' '}
              <FormControl
                name="endDate"
                type="date"
                value={this.state.endDate}
                onChange={this.handleChangeEnd}/>
            </FormGroup>
            {' '}
            <FormGroup>
              <Button type="submit"
                      onClick={this.onSubmit}>Загрузить</Button>
              {' '}
            </FormGroup>
          </Navbar.Form>
        </Navbar>
        <br/>
        <div id="comp">
          <div className="col-lg-4 col-lg-offset-4">
            <FormControl
              componentClass="textarea"
              type="text"
              onChange={this.onApiKeysChange}
              placeholder="API-Keys"/>
            <br/>
          </div>
          <div className="col-lg-4 col-lg-offset-4">
            <Table striped bordered condensed hover>
              <thead>
              <tr>
                <th>#</th>
                <th>Лицевой счет</th>
                <th>Тарифный план</th>
                <th>Итого</th>
                <th>Детализация</th>
              </tr>
              </thead>
              <tbody>
                {this.state.components}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
