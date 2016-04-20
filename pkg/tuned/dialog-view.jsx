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
    "base1/cockpit",
], function(React, cockpit) {

"use strict";
var _ = cockpit.gettext;

/*
 * React template for a Cockpit dialog footer
 * It can display an error, wait for an action to complete,
 * has a 'Cancel' button and an action button (defaults to 'OK')
 * Expected props:
 *  - cancel_clicked optional
 *     Callback called when the dialog is canceled
 *  - cancel_caption optional, defaults to 'Cancel'
 *  - primary_clicked
 *     Callback function that is expected to return a promise.
 *     parameter: callback to set the progress text (will be displayed next to spinner)
 *  - primary_caption optional, defaults to 'Ok'
 *  - primary_disabled optional, defaults to false
 *  - static_error optional, always show this error
 *  - dialog_done optional, callback when dialog is finished (param true if success, false on cancel)
 */
var DialogFooter = React.createClass({
    propTypes: {
        cancel_clicked: React.PropTypes.func,
        cancel_caption: React.PropTypes.string,
        primary_clicked: React.PropTypes.func.isRequired,
        primary_caption: React.PropTypes.string,
        primary_disabled: React.PropTypes.bool,
        static_error: React.PropTypes.string,
        dialog_done: React.PropTypes.func,
    },
    getInitialState: function() {
        return {
            action_in_progress: false,
            action_progress_message: '',
            error_message: null,
        };
    },
    keyUpHandler: function(e) {
        if (e.keyCode == 27) {
            this.cancel_click();
            e.stopPropagation();
        }
    },
    componentDidMount: function() {
        document.body.classList.add("modal-in");
        document.addEventListener('keyup', this.keyUpHandler.bind(this));
    },
    componentWillUnmount: function() {
        document.body.classList.remove("modal-in");
        document.removeEventListener('keyup', this.keyUpHandler.bind(this));
    },
    update_progress: function(msg) {
        this.setState({ action_progress_message: msg });
    },
    primary_click: function(e) {
        // only consider clicks with the primary button
        if (e && e.button !== 0)
            return;
        var self = this;
        this.setState({ action_in_progress: true });
        this.props.primary_clicked(this.update_progress.bind(this))
            .done(function() {
                self.setState({ action_in_progress: false, error_message: null });
                if (self.props.dialog_done)
                    self.props.dialog_done(true);
            })
            .fail(function(error) {
                self.setState({ action_in_progress: false, error_message: error });
            });
        if (e)
            e.stopPropagation();
    },
    cancel_click: function(e) {
        // only consider clicks with the primary button
        if (e && e.button !== 0)
            return;
        if (this.props.cancel_clicked)
            this.props.cancel_clicked();
        if (this.props.dialog_done)
            this.props.dialog_done(false);
        if (e)
            e.stopPropagation();
    },
    render: function() {
        var cancel_caption;
        if ('cancel_caption' in this.props)
            cancel_caption = this.props.cancel_caption;
        else
            cancel_caption = _("Cancel");

        var primary_caption;
        if ('primary_caption' in this.props)
            primary_caption = this.props.primary_caption;
        else
            primary_caption = _("Ok");

        // If an action is in progress, show the spinner with its message and siable the primary action
        var wait_element;
        var primary_disabled;
        if (this.state.action_in_progress) {
            primary_disabled = 'disabled';
            wait_element = <div className="dialog-wait pull-left">
                               <div className="spinner spinner-sm"></div>
                               <span>{ this.state.action_progress_message }</span>
                           </div>;
        } else {
            primary_disabled = this.props.primary_disabled || null;
        }

        // If we have an error message, display the error
        var error_element;
        var error_message;
        if (this.props.static_error !== undefined)
            error_message = this.props.static_error;
        else
            error_message = this.state.error_message;
        if (error_message) {
            error_element = <div className="alert alert-danger dialog-error">
                                <span className="fa fa-exclamation-triangle"></span>
                                <span>{ error_message }</span>
                            </div>;
        }
        return (
            <div className="modal-footer">
                { error_element }
                { wait_element }
                <button
                    className="btn btn-default cancel"
                    onClick={ this.cancel_click.bind(this) }
                    >{ cancel_caption }</button>
                <button
                    className="btn btn-primary apply"
                    onClick={ this.primary_click.bind(this) }
                    disabled={ primary_disabled }
                    >{ primary_caption }</button>
            </div>
        );
    }
});

/*
 * React template for a Cockpit dialog
 * The primary action button is disabled while its action is in progress (waiting for promise)
 * Expected props:
 *  - title (string)
 *  - no_backdrop optional, skip backdrop if true
 *  - body (react element, top element should be of class modal-body)
 *      It is recommended for information gathering dialogs to pass references
 *      to the input components to the controller. That way, the controller can
 *      extract all necessary information (e.g. for input validation) when an
 *      action is triggered.
 *  - footer (react element, top element should be of class modal-footer)
 */
var Dialog = React.createClass({
    propTypes: {
        title: React.PropTypes.string.isRequired,
        no_backdrop: React.PropTypes.bool,
        body: React.PropTypes.element.isRequired,
        footer: React.PropTypes.element.isRequired,
    },
    render: function() {
        var backdrop;
        if (!this.props.no_backdrop) {
            backdrop = <div className="modal-backdrop fade in"></div>;
        }
        return (
            <div>
                { backdrop }
                <div className="modal fade in dialog-visible" tabindex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">{ this.props.title }</h4>
                            </div>
                            { this.props.body }
                            { this.props.footer }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

/* Create and show a dialog
 * For this, create a containing DOM node at the body level
 */
var show_modal_dialog = function(dialog_props, footer_props) {
    // create an element to render into
    var root_element = document.createElement("div");
    document.body.appendChild(root_element);

    // register our own on-close callback
    var orig_callback = null;
    if (typeof(footer_props) === 'object' && 'dialog_done' in footer_props)
        orig_callback = footer_props.dialog_done;
    var close_callback = function(args) {
        if (orig_callback)
            orig_callback.apply(this, arguments);
        root_element.remove();
    };
    footer_props.dialog_done = close_callback;
    dialog_props.footer = React.createElement(DialogFooter, footer_props);

    // create the dialog
    React.render(React.createElement(Dialog, dialog_props), root_element);
};

return {
    Dialog: Dialog,
    DialogFooter: DialogFooter,
    show_modal_dialog: show_modal_dialog,
};

});

