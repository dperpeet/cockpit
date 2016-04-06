/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */
define([
    "react",
], function(React) {

"use strict";

/* entry for an alert in the listing, can be expanded (with details) or standard */
var ExpandableRow = React.createClass({
    tab_renderers: [
        { name: "Solutions",
          renderer: SELinuxEventDetails,
        },
        { name: "Audit log",
          renderer: SELinuxEventLog,
        },
    ],
    getInitialState: function() {
        return {
            expanded: false, // show extended info, one line summary if false
            active_tab: 0, // currently active tab in expanded mode, defaults to first tab
        };
    },
    handleClick: function() {
        this.setState( {expanded: !this.state.expanded });
    },
    handleDismissClick: function(e) {
        e.stopPropagation();
    },
    handleTabClick: function(tab_idx, e) {
        this.setState( {active_tab: tab_idx } );
        e.stopPropagation();
        e.preventDefault();
    },
    render: function() {
        var self = this;
        var bodyProps = {className: '', onClick: this.handleClick};
        var count_display = null;
        if (this.state.expanded) {
            if (this.props.count > 1)
                count_display = <span className="pull-right">{ this.props.count + " occurrences"}</span>;
            var links = this.tab_renderers.map(function(itm, idx) {
                return (
                    <li key={ idx } className={ (idx === self.state.active_tab) ? "active" : ""} >
                        <a href="#" onClick={ self.handleTabClick.bind(self, idx) }>{ itm.name }</a>
                    </li>
                );
            });
            var active_renderer = this.tab_renderers[this.state.active_tab].renderer;
            return (
                <tbody className="open">
                    <tr className="listing-item" onClick={ this.handleClick } />
                    <tr className="listing-panel">
                        <td colSpan="2">
                            <div className="listing-head"  onClick={ this.handleClick }>
                                <div className="listing-actions">
                                     <button title="Dismiss"
                                            className="pficon pficon-delete btn btn-danger"
                                            disabled
                                            onClick={ this.handleDismissClick }>
                                    </button>
                                </div>
                                <h3>{this.props.description}</h3>
                                { count_display }
                                <ul className="nav nav-tabs nav-tabs-pf">
                                    { links }
                                </ul>
                            </div>
                            <div className="listing-body">
                                { React.createElement(active_renderer, this.props) }
                            </div>
                        </td>
                    </tr>
                </tbody>
            );
        } else {
            if (this.props.count > 1)
                count_display = <span className="badge">{ this.props.count }</span>;
            return (
                <tbody>
                    <tr className="listing-item" onClick={ this.handleClick }>
                        <td>{ this.props.description }</td>
                        <td>{ count_display }</td>
                    </tr>
                    <tr className="listing-panel" onClick={ this.handleClick } />
                </tbody>
            );
        }
    }
});

/* Implements a PatternFly 'List View' pattern
 * https://www.patternfly.org/list-view/
 * Otherwise we have blank slate: trying to connect, error
 * Properties:
 * - title
 * - entries optional, e.g. array of ExpandableRow items
 */
var Listing = React.createClass({
    render: function() {
            return (
                <table className="listing listing-view">
                    <thead>
                        <tr>
                            <td colSpan="2">
                                <h3>{ this.props.title }</h3>
                            </td>
                        </tr>
                    </thead>
                    { this.props.entries }
                </table>
            );
        }
    }
});

return {
    foo: bar,
};

});
