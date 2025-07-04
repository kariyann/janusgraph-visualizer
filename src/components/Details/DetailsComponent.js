import React from 'react';
import { connect } from 'react-redux';
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  List,
  ListItem,
  ListItemText,
  TextField,
  Fab,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  Switch,
  Divider,
  Tooltip,
  Button
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import _ from 'lodash';
import { JsonToTable } from 'react-json-to-table';
import { ACTIONS, COMMON_GREMLIN_ERROR, QUERY_ENDPOINT } from '../../constants';
import axios from "axios";
import { onFetchQuery} from '../../logics/actionHelper';
import { stringifyObjectValues} from '../../logics/utils';
import { SketchPicker } from 'react-color';

class Details extends React.Component {

  onAddNodeLabel() {
    this.props.dispatch({ type: ACTIONS.ADD_NODE_LABEL });
  }

  onEditNodeLabel(index, nodeLabel) {
    this.props.dispatch({ type: ACTIONS.EDIT_NODE_LABEL, payload: { id: index, nodeLabel } });
  }

  onRemoveNodeLabel(index) {
    this.props.dispatch({ type: ACTIONS.REMOVE_NODE_LABEL, payload: index });
  }

  onEditNodeLimit(limit) {
    this.props.dispatch({ type: ACTIONS.SET_NODE_LIMIT, payload: limit });
  }

  onRefresh() {
    this.props.dispatch({ type: ACTIONS.REFRESH_NODE_LABELS, payload: this.props.nodeLabels });
  }

  onTraverse(nodeId, direction) {
    const query = `g.V('${nodeId}').${direction}()`;
    axios.post(
      QUERY_ENDPOINT,
      { host: this.props.host, port: this.props.port, query: query, nodeLimit: this.props.nodeLimit, traversalSource: this.props.traversalSource },
      { headers: { 'Content-Type': 'application/json' } }
    ).then((response) => {
      onFetchQuery(response, query, this.props.nodeLabels, this.props.dispatch);
    }).catch((error) => {
      this.props.dispatch({ type: ACTIONS.SET_ERROR, payload: COMMON_GREMLIN_ERROR });
    });
  }

  onTogglePhysics(enabled){
    this.props.dispatch({ type: ACTIONS.SET_IS_PHYSICS_ENABLED, payload: enabled });
    if (this.props.network) {
      const edges = {
        smooth: {
          type: enabled ? 'dynamic' : 'continuous'
        }
      };
      this.props.network.setOptions( { physics: enabled, edges } );
    }
  }

  generateList(list) {
    let key = 0;
    return list.map(value => {
      key = key+1;
      return React.cloneElement((
        <ListItem>
          <ListItemText
            primary={value}
          />
        </ListItem>
      ), {
        key
      })
    });
  }

  generateNodeLabelList(nodeLabels) {
    let index = -1;
    return nodeLabels.map( nodeLabel => {
      index = index+1;
      nodeLabel.index = index;
      return React.cloneElement((
        <ListItem>
          <TextField id="standard-basic" label="Node Type" InputLabelProps={{ shrink: true }} value={nodeLabel.type} onChange={event => {
            const type = event.target.value;
            const field = nodeLabel.field;
            this.onEditNodeLabel(nodeLabel.index, { type, field })
          }}
          />
          <TextField id="standard-basic" label="Label Field" InputLabelProps={{ shrink: true }} value={nodeLabel.field} onChange={event => {
            const field = event.target.value;
            const type = nodeLabel.type;
            this.onEditNodeLabel(nodeLabel.index, { type, field })
          }}/>
          <IconButton aria-label="delete" size="small" onClick={() => this.onRemoveNodeLabel(nodeLabel.index)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </ListItem>
      ), {
        key: index
      })
    });
  }

  handleNodeStyleChange(index, field, value) {
    const updatedStyles = [...this.props.graphStyles.nodeStyles];
    updatedStyles[index][field] = value;
    this.props.dispatch({ type: ACTIONS.UPDATE_GRAPH_STYLES, payload: { nodeStyles: updatedStyles } });
  }

  handleEdgeStyleChange(index, field, value) {
    const updatedStyles = [...this.props.graphStyles.edgeStyles];
    updatedStyles[index][field] = value;
    this.props.dispatch({ type: ACTIONS.UPDATE_GRAPH_STYLES, payload: { edgeStyles: updatedStyles } });
  }

  addNodeStyle = () => {
    const newStyle = { property: '', value: '', color: '#000000', shape: 'dot', size: 25 };
    const updatedStyles = [...this.props.graphStyles.nodeStyles, newStyle];
    this.props.dispatch({ type: ACTIONS.UPDATE_GRAPH_STYLES, payload: { nodeStyles: updatedStyles } });
  }

  addEdgeStyle = () => {
    const newStyle = { property: '', value: '', color: '#848484', width: 1, dashes: false };
    const updatedStyles = [...this.props.graphStyles.edgeStyles, newStyle];
    this.props.dispatch({ type: ACTIONS.UPDATE_GRAPH_STYLES, payload: { edgeStyles: updatedStyles } });
  }

  render(){
    let hasSelected = false;
    let selectedType = null;
    let selectedId = null ;
    let selectedProperties = null;
    let selectedHeader = null;
    if (!_.isEmpty(this.props.selectedNode)) {
      hasSelected = true;
      selectedType =  _.get(this.props.selectedNode, 'type');
      selectedId = _.get(this.props.selectedNode, 'id');
      selectedProperties = _.get(this.props.selectedNode, 'properties');
      stringifyObjectValues(selectedProperties);
      selectedHeader = 'Node';
    } else if (!_.isEmpty(this.props.selectedEdge)) {
      hasSelected = true;
      selectedType =  _.get(this.props.selectedEdge, 'type');
      selectedId = _.get(this.props.selectedEdge, 'id');
      selectedProperties = _.get(this.props.selectedEdge, 'properties');
      selectedHeader = 'Edge';
      stringifyObjectValues(selectedProperties);
    }


    return (
      <div className={'details'}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12}>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Query History</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <List dense={true}>
                  {this.generateList(this.props.queryHistory)}
                </List>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Settings</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={12}>
                    <Tooltip title="Automatically stabilize the graph" aria-label="add">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={this.props.isPhysicsEnabled}
                          onChange={() => { this.onTogglePhysics(!this.props.isPhysicsEnabled); }}
                          value="physics"
                          color="primary"
                        />
                      }
                      label="Enable Physics"
                    />
                    </Tooltip>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Tooltip title="Number of maximum nodes which should return from the query. Empty or 0 has no restrictions." aria-label="add">
                      <TextField label="Node Limit" type="Number" variant="outlined" value={this.props.nodeLimit} onChange={event => {
                        const limit = event.target.value;
                        this.onEditNodeLimit(limit)
                      }} />
                    </Tooltip>

                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Typography>Node Labels</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <List dense={true}>
                      {this.generateNodeLabelList(this.props.nodeLabels)}
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Fab variant="extended" color="primary" size="small" onClick={this.onRefresh.bind(this)}>
                      <RefreshIcon />
                      Refresh
                    </Fab>
                    <Fab variant="extended" size="small" onClick={this.onAddNodeLabel.bind(this)}>
                      <AddIcon />
                      Add Node Label
                    </Fab>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Graph Styling</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">Node Styles</Typography>
                    {this.props.graphStyles.nodeStyles.map((style, index) => (
                      <div key={index}>
                        <TextField
                          label="Property"
                          value={style.property}
                          onChange={(e) => this.handleNodeStyleChange(index, 'property', e.target.value)}
                        />
                        <TextField
                          label="Value"
                          value={style.value}
                          onChange={(e) => this.handleNodeStyleChange(index, 'value', e.target.value)}
                        />
                        <TextField
                          label="Shape"
                          value={style.shape}
                          onChange={(e) => this.handleNodeStyleChange(index, 'shape', e.target.value)}
                        />
                        <TextField
                          label="Size"
                          type="number"
                          value={style.size}
                          onChange={(e) => this.handleNodeStyleChange(index, 'size', e.target.value)}
                        />
                        <SketchPicker
                          color={style.color}
                          onChange={(color) => this.handleNodeStyleChange(index, 'color', color.hex)}
                        />
                      </div>
                    ))}
                    <Button onClick={this.addNodeStyle}>Add Node Style</Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Edge Styles</Typography>
                    {this.props.graphStyles.edgeStyles.map((style, index) => (
                      <div key={index}>
                        <TextField
                          label="Property"
                          value={style.property}
                          onChange={(e) => this.handleEdgeStyleChange(index, 'property', e.target.value)}
                        />
                        <TextField
                          label="Value"
                          value={style.value}
                          onChange={(e) => this.handleEdgeStyleChange(index, 'value', e.target.value)}
                        />
                        <TextField
                          label="Width"
                          type="number"
                          value={style.width}
                          onChange={(e) => this.handleEdgeStyleChange(index, 'width', e.target.value)}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={style.dashes}
                              onChange={(e) => this.handleEdgeStyleChange(index, 'dashes', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Dashes"
                        />
                        <SketchPicker
                          color={style.color}
                          onChange={(color) => this.handleEdgeStyleChange(index, 'color', color.hex)}
                        />
                      </div>
                    ))}
                    <Button onClick={this.addEdgeStyle}>Add Edge Style</Button>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          {hasSelected &&
          <Grid item xs={12} sm={12} md={12}>
            <h2>Information: {selectedHeader}</h2>
            {selectedHeader === 'Node' &&
            <Grid item xs={12} sm={12} md={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={6} md={6}>
                  <Fab variant="extended" size="small" onClick={() => this.onTraverse(selectedId, 'out')}>
                    Traverse Out Edges
                    <ArrowForwardIcon/>
                  </Fab>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <Fab variant="extended" size="small" onClick={() => this.onTraverse(selectedId, 'in')}>
                    Traverse In Edges
                    <ArrowBackIcon/>
                  </Fab>
                </Grid>
              </Grid>
            </Grid>
            }
            <Grid item xs={12} sm={12} md={12}>
              <Grid container>
                <Table aria-label="simple table">
                  <TableBody>
                    <TableRow key={'type'}>
                      <TableCell scope="row">Type</TableCell>
                      <TableCell align="left">{String(selectedType)}</TableCell>
                    </TableRow>
                    <TableRow key={'id'}>
                      <TableCell scope="row">ID</TableCell>
                      <TableCell align="left">{String(selectedId)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <JsonToTable json={selectedProperties}/>
              </Grid>
            </Grid>
          </Grid>
          }
        </Grid>
      </div>
    );
  }
}

export const DetailsComponent = connect((state)=>{
  return {
    host: state.gremlin.host,
    port: state.gremlin.port,
    traversalSource: state.gremlin.traversalSource,
    network: state.graph.network,
    selectedNode: state.graph.selectedNode,
    selectedEdge: state.graph.selectedEdge,
    queryHistory: state.options.queryHistory,
    nodeLabels: state.options.nodeLabels,
    nodeLimit: state.options.nodeLimit,
    isPhysicsEnabled: state.options.isPhysicsEnabled,
    graphStyles: state.options.graphStyles
  };
})(Details);