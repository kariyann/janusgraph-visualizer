import React from 'react';
import {connect} from 'react-redux';
import { Network } from 'vis-network';
import { ACTIONS } from '../../constants';
import { Menu, MenuItem } from '@material-ui/core';
import axios from 'axios';

class NetworkGraph extends React.Component {
  state = {
    contextMenu: null,
    selectedNode: null
  };

  componentDidMount() {
    const data = {
      nodes: this.props.nodeHolder,
      edges: this.props.edgeHolder
    };
    const network = new Network(this.refs.myRef, data, {
      ...this.props.networkOptions,
      manipulation: {
        enabled: true
      }
    });

    network.on('selectNode', (params) => {
      const nodeId = params.nodes && params.nodes.length > 0 ? params.nodes[0] : null;
      this.props.dispatch({ type: ACTIONS.SET_SELECTED_NODE, payload: nodeId });
    });

    network.on("selectEdge", (params) => {
      const edgeId = params.edges && params.edges.length === 1 ? params.edges[0] : null;
      const isNodeSelected = params.nodes && params.nodes.length > 0;
      if (!isNodeSelected && edgeId !== null) {
        this.props.dispatch({ type: ACTIONS.SET_SELECTED_EDGE, payload: edgeId });
      }
    });

    network.on("oncontext", (params) => {
      params.event.preventDefault();
      const nodeId = network.getNodeAt(params.pointer.DOM);
      if (nodeId) {
        this.setState({
          contextMenu: {
            mouseX: params.event.clientX - 2,
            mouseY: params.event.clientY - 4,
          },
          selectedNode: nodeId
        });
      }
    });

    this.props.dispatch({ type: ACTIONS.SET_NETWORK, payload: network });
  }

  handleContextMenuClose = () => {
    this.setState({
      contextMenu: null,
      selectedNode: null
    });
  };

  handleExpandNode = async (direction) => {
    const { selectedNode } = this.state;
    if (selectedNode) {
      try {
        const response = await axios.post('/api/expand-node', {
          nodeId: selectedNode,
          direction
        });
        // Handle the response and update the graph
        this.props.dispatch({ type: ACTIONS.ADD_NODES, payload: response.data.nodes });
        this.props.dispatch({ type: ACTIONS.ADD_EDGES, payload: response.data.edges });
      } catch (error) {
        console.error('Error expanding node:', error);
      }
    }
    this.handleContextMenuClose();
  };

  render() {
    const { contextMenu } = this.state;
    
    return (
      <>
        <div ref={'myRef'} className={'mynetwork'} />
        <Menu
          keepMounted
          open={contextMenu !== null}
          onClose={this.handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={() => this.handleExpandNode('in')}>Expand Incoming Links</MenuItem>
          <MenuItem onClick={() => this.handleExpandNode('out')}>Expand Outgoing Links</MenuItem>
        </Menu>
      </>
    );
  }
}

export const NetworkGraphComponent = connect((state)=>{
  return {
    nodeHolder: state.graph.nodeHolder,
    edgeHolder: state.graph.edgeHolder,
    networkOptions: state.options.networkOptions,
    graphStyles: state.options.graphStyles
  };
})(NetworkGraph);