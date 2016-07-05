import React from 'react';
import Checkbox from '../../components/Checkbox';
import ItemsTableCell from '../../components/ItemsTableCell';
import ItemsTableValue from '../../components/ItemsTableValue';
import { updateModel } from './util'

var EditableBooleanColumn = React.createClass({
  getInitialState () {
    return {checked: this.props.data.fields[this.props.col.path]}
  },
  displayName: 'EditableBooleanColumn',
  propTypes: {
    col: React.PropTypes.object,
    data: React.PropTypes.object,
  },
  change (e) {
    this.setState({checked: !this.state.checked})
    updateModel(this.props.list.id, this.props.data.id, {[this.props.col.path]: !this.state.checked})
    console.log(this.props.data)
  },
  renderValue () {
    return (
      <ItemsTableValue truncate={false} field={this.props.col.type}>
        <Checkbox checked={this.state.checked} onChange={this.change.bind(this)}/>
      </ItemsTableValue>
    );
  },
  render () {
    return (
      <ItemsTableCell>
        {this.renderValue()}
      </ItemsTableCell>
    );
  },
});

module.exports = EditableBooleanColumn;
