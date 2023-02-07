import React, { useState, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';

import './main.css';

const RequestContext = createContext({});

const RequestTypeSelector = () => {
  const { type, setType } = useContext(RequestContext);
  return (
    <select value={type} onChange={e => setType(e.target.value)}  >
      <optgroup label="HTTP" >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="PATCH">PATCH</option>
        <option value="DELETE">DELETE</option>
        <option value="HEAD">HEAD</option>
        <option value="OPTIONS">OPTIONS</option>
      </optgroup>

      <option value="tcp">TCP</option>
      <option value="sse">SSE</option>
      <option value="mqtt">MQTT</option>
      <option value="ws">WebSocket</option>
      <option value="gql">GraphQL</option>
    </select>
  );
};

const RequestHeader: React.FC = ({ header, onChange }) => {
  const { name, value } = header;
  const handleChange = (name) => {
    return e => {
      const { value } = e.target;
      header[name] = value;
      onChange(header);
    }
  };
  return (
    <div className="request-header-line" >
      <input type="text" placeholder="key" value={name} onChange={handleChange('name')} />
      <input type="text" placeholder="value" value={value} onChange={handleChange('value')} />
    </div>
  );
};

const RequestHeaders = ({ }) => {
  const { headers, setHeaders } = useContext(RequestContext);
  const addHeader = () => {
    setHeaders([...headers, {}]);
  };
  const handleChange = index => {
    return data => {
      headers[index] = data;
      setHeaders([...headers]);
    };
  };
  return (
    <div className="request-headers">
      <div className="request-header-heading" >
        <h3>Headers</h3>
        <div><a onClick={addHeader}>[+ add header]</a></div>
      </div>
      <div className="request-headers-list" >
        {
          headers.map((header, i) => <RequestHeader key={i} header={header} onChange={handleChange(i)} />)
        }
      </div>
    </div>
  );
};

const BodyEditor = ({ body = "", readonly = false }) => {
  return (
    <div className="body-editor request-body response-body">
      <h3>Body</h3>
      <textarea defaultValue={body} readOnly={readonly} ></textarea>
    </div>
  );
};

const RequestForm = ({ onRequest }) => {
  const [type, setType] = useState('GET');
  const [url, setURL] = useState();
  const [headers, setHeaders] = useState([{ name: 'content-type', value: 'application/json' }]);
  const context = { headers, setHeaders, type, setType, url };
  const handleSubmit = e => {
    e.preventDefault();
    onRequest && onRequest(context);
  };
  return (
    <RequestContext.Provider value={context} >
      <form className="request-form" onSubmit={handleSubmit}  >
        <h2>Request</h2>
        <div className="request-head" >
          <RequestTypeSelector />
          <input name="url" type="url" defaultValue="https://httpbin.org" placeholder="URL" required onChange={e => setURL(e.target.value)} />
          <button type="submit" >send</button>
        </div>
        <RequestHeaders />
        <BodyEditor />
      </form>
    </RequestContext.Provider>
  );
};

const ResponseHeader = ({ header }) => {
  const { name, value } = header;
  return (
    <div className="response-header" >
      <span>{name}</span>
      <span>{value}</span>
    </div>
  );
};

const ResponseHeaders = ({ headers }) => {
  headers = Array.isArray(headers) ? headers : Object.entries(headers);
  console.log(headers);
  return (
    <div className="response-headers" >
      <div className="request-header-heading" >
        <h3>Headers</h3>
      </div>
      <div className="response-headers-list">
        {
          headers.map((header, i) => <ResponseHeader header={header} />)
        }
      </div>
    </div>
  );
};

const ResponseForm = ({ response }) => {
  const { status = '[not ready]', headers = [], body } = response;
  return (
    <div className="response-form" >
      <h2>Response</h2>
      <div className="response-head" >
        status code: {status}
      </div>
      <ResponseHeaders headers={headers} />
      <BodyEditor body={body} readonly={true} />
    </div>
  );
};

const HistoryItem: React.FC = ({ record }) => {
  const { type, status, url } = record;
  return (
    <tr>
      <td>{type}</td>
      <td>{url}</td>
      <td>{status}</td>
    </tr>
  );
};

const History = ({ history }) => {
  return (
    <div className="history" >
      <h2>History</h2>
      <table className="history-table" >
        <thead>
          <tr>
            <th>type</th>
            <th>url</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {
            history.map((item, i) => <HistoryItem key={i} record={item} />)
          }
        </tbody>
      </table>
    </div>
  );
};

const ChroxyApp = () => {
  const [history, setHistory] = useState([
    { type: 'GET', url: 'https://baidu.com', status: 200 },
  ]);
  const addHistory = record => {
    setHistory([...history, record]);
  };
  const [response, setResponse] = useState({});
  const onRequest = async request => {
    addHistory(request);
    console.log('request', request);
    const { type, url, ...init } = request;
    init.method = type;
    init.headers = init.headers.reduce((headers, { name, value }) => {
      headers[name] = value;
      return headers;
    }, {});
    const res = await fetch(url, init);
    const headers = [];
    // @ts-ignore
    for (const [name, value] of res.headers.entries()) {
      headers.push({ name, value });
    }
    const body = await res.text();
    setResponse({ status: res.status, body, headers, ...res });
  };
  return (
    <div className="chroxy-app" >
      <header>
        <h1>Chroxy</h1>
      </header>
      <div className="rr-group">
        <RequestForm onRequest={onRequest} />
        <ResponseForm response={response} />
      </div>
      <History history={history} />
    </div>
  );
};

const dom = document.getElementById('app');
ReactDOM.render(<ChroxyApp />, dom);
