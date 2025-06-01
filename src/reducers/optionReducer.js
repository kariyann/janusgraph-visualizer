import { ACTIONS } from '../constants';

const initialState = {
  queryHistory: [],
  nodeLabels: [],
  nodeLimit: 100,
  isPhysicsEnabled: true,
  networkOptions: {
    physics: {
      enabled: true
    }
  },
  graphStyles: {
    nodeStyles: [],
    edgeStyles: [],
    defaultNodeColor: '#7BE141',
    defaultEdgeColor: '#848484'
  }
};

export default function optionReducer(state = initialState, action) {
  switch (action.type) {
    case ACTIONS.ADD_QUERY_HISTORY:
      return {
        ...state,
        queryHistory: [...state.queryHistory, action.payload]
      };
    
    case ACTIONS.CLEAR_QUERY_HISTORY:
      return {
        ...state,
        queryHistory: []
      };

    case ACTIONS.SET_NODE_LABELS:
      return {
        ...state,
        nodeLabels: action.payload
      };

    case ACTIONS.ADD_NODE_LABEL:
      return {
        ...state,
        nodeLabels: [...state.nodeLabels, action.payload]
      };

    case ACTIONS.EDIT_NODE_LABEL:
      return {
        ...state,
        nodeLabels: state.nodeLabels.map(label => 
          label.id === action.payload.id ? action.payload : label
        )
      };

    case ACTIONS.REMOVE_NODE_LABEL:
      return {
        ...state,
        nodeLabels: state.nodeLabels.filter(label => label.id !== action.payload)
      };

    case ACTIONS.REFRESH_NODE_LABELS:
      return {
        ...state,
        nodeLabels: [...state.nodeLabels]
      };

    case ACTIONS.SET_NODE_LIMIT:
      return {
        ...state,
        nodeLimit: action.payload
      };

    case ACTIONS.SET_IS_PHYSICS_ENABLED:
      return {
        ...state,
        isPhysicsEnabled: action.payload,
        networkOptions: {
          ...state.networkOptions,
          physics: {
            ...state.networkOptions.physics,
            enabled: action.payload
          }
        }
      };

    default:
      return state;
  }
}