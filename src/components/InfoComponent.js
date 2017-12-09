import React, {Component} from 'react';
import XLSX from 'xlsx'
import FileSaver from 'file-saver';
import {Button} from 'react-bootstrap'


function Workbook() {
  if(!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

class InfoComponent extends Component {
  constructor(props) {
    super(props);
    const {apiKey, startDate, endDate, num} = this.props;
    this.state = {
      total: 0,
      statisticUrl: `https://digitoffice.ru/api2/${apiKey}/Statistics?start=${startDate}%2000:00&end=${endDate}%2023:59&results=100000`,
      infoUrl: `https://digitoffice.ru/api2/${apiKey}/info`,
      licnum: '',
      plan: '',
      records: [],
      num: num,
      apiKey: apiKey
    };
  }

  exportToExcel = () => {
    function s2ab(s) {
      let buf = new ArrayBuffer(s.length);
      let view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    let wb = new Workbook();
    let ws = XLSX.utils.json_to_sheet(this.state.records);
    wb.SheetNames.push('Лист1');
    wb.Sheets['Лист1'] = ws;
    let wbout = XLSX.write(wb, {type: 'binary'});
    try {
      FileSaver.saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), `output_${this.state.licnum}.xlsx`);
    } catch (e) {
      if (typeof console !== 'undefined') console.log(e, wbout);
    }
    return wbout;
  };

  async componentDidMount() {
    if (this.state.apiKey) {
      await fetch(this.state.infoUrl)
        .then(response => response.json())
        .then(data => this.setState({
          licnum: data.licnum,
          plan: data.plan,
        }));
      await fetch(this.state.statisticUrl)
        .then(response => response.json())
        .then(data => data.records.filter((obj => obj.call_cost)))
        .then(data => {
          let total = 0;
          for (let rec of data) {
            rec.call_cost = parseFloat(rec.call_cost);
            total += rec.call_cost
          }
          this.setState({
            total: total.toFixed(2),
            records: data,
          })
        });
    }
  }

  render() {
    const {num, licnum, plan, total} = this.state;
    return (
      <tr>
        <th>{num}</th>
        <th>{licnum}</th>
        <th>{plan}</th>
        <th>{total}</th>
        <th><Button bsStyle='link' onClick={this.exportToExcel}>Скачать</Button></th>
      </tr>
    )
  }
}

export default InfoComponent;