import React, {Component} from 'react';
import {Button, ControlLabel, FormControl, FormGroup, Navbar} from 'react-bootstrap'
import moment from 'moment';
import XLSX from 'xlsx'
import FileSaver from "file-saver";
import ReactTable from "react-table";
import 'react-table/react-table.css'


function Workbook() {
  if ((this instanceof Workbook)) {
    this.SheetNames = [];
    this.Sheets = {};
  } else {
    return new Workbook();
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKeys: '',
      startDate: moment().startOf('year').format('YYYY-MM-DD'),
      endDate: moment().endOf('year').format('YYYY-MM-DD'),
      components: {},
      loading: false,
      noDataText: 'Еще ничего не загружалось',
    };
    this.onSubmit = this.onSubmit.bind(this)
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

  async onSubmit(e) {
    e.preventDefault();
    this.setState({loading: true});
    let startDate = moment(this.state.startDate).format('DD.MM.YYYY');
    let endDate = moment(this.state.endDate).format('DD.MM.YYYY');
    let apiKeys = new Set(this.state.apiKeys.split('\n'));
    let components = {};
    for (let apiKey of apiKeys) {
      let total = 0,
        statisticUrl = `https://digitoffice.ru/api2/${apiKey}/Statistics?start=${startDate}%2000:00&end=${endDate}%2023:59&results=100000`,
        infoUrl = `https://digitoffice.ru/api2/${apiKey}/info`,
        licnum = '',
        plan = '',
        records = [];
      await fetch(infoUrl)
        .then(response => response.json())
        .then(data => {
          licnum = data.licnum;
          plan = data.plan
        });
      await fetch(statisticUrl)
        .then(response => response.json())
        .then(data => {
          let data_ = [];
          if (data.ok) {
            data_ = data.records.filter((obj => obj.call_cost))
          } else {
            console.log(data.message)
          }
          return data_
        })
        .then(data => {
          for (let rec of data) {
            rec.call_cost = parseFloat(rec.call_cost);
            total += rec.call_cost
          }
            total = total.toFixed(2);
            records = data;
          });
      components[licnum] = {
        total: total,
        licnum: licnum,
        plan: plan,
        records: records,
      }
    }
    this.setState({
      components: components,
      loading: false,
      noDataText: Object.values(components).length === 0 ? 'Ничего не найдено :(' : 'Пусто',
    })
  };

  exportToExcel = (licnum) => {
    function s2ab(s) {
      let buf = new ArrayBuffer(s.length);
      let view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    let wb = new Workbook();
    let ws = XLSX.utils.json_to_sheet(this.state.components[licnum].records);
    wb.SheetNames.push('Лист1');
    wb.Sheets['Лист1'] = ws;
    let wbout = XLSX.write(wb, {type: 'binary'});
    try {
      FileSaver.saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), `output_${licnum}.xlsx`);
    } catch (e) {
      if (typeof console !== 'undefined') console.log(e, wbout);
    }
    return wbout;
  };

  render() {
    const columns = [{
      Header: 'л/с',
      accessor: 'licnum',
    }, {
      Header: 'Тарифный план',
      accessor: 'plan',
    }, {
      Header: 'Итого',
      accessor: 'total',
    }, {
      Header: 'Детализация',
      accessor: 'details',
      Cell: row => (<Button bsStyle='link' disabled={!row.original.licnum} onClick={() => this.exportToExcel(row.original.licnum)}>Скачать</Button>)
    }

    ];
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
            <ReactTable
              data={Object.values(this.state.components)}
              columns={columns}
              defaultPageSize={10}
              loading={this.state.loading}
              showPaginationBottom={false}
              loadingText={'Загружается...'}
              noDataText={this.state.noDataText}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
