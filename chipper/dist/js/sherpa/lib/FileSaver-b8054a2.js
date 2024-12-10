/* FileSaver.js
 *  A saveAs() FileSaver implementation.
 *  2014-05-27
 *
 *  By Eli Grey, http://eligrey.com
 *  License: X11/MIT
 *    See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */ /*global self */ /*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */ /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */ var saveAs = saveAs || typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator) || function(view) {
    "use strict";
    // IE <10 is explicitly unsupported
    if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var doc = view.document, get_URL = function() {
        return view.URL || view.webkitURL || view;
    }, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"), can_use_save_link = !view.externalHost && "download" in save_link, click = function(node) {
        var event = doc.createEvent("MouseEvents");
        event.initMouseEvent("click", true, false, view, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        node.dispatchEvent(event);
    }, webkit_req_fs = view.webkitRequestFileSystem, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem, throw_outside = function(ex) {
        (view.setImmediate || view.setTimeout)(function() {
            throw ex;
        }, 0);
    }, force_saveable_type = "application/octet-stream", fs_min_size = 0, deletion_queue = [], process_deletion_queue = function() {
        var i = deletion_queue.length;
        while(i--){
            var file = deletion_queue[i];
            if (typeof file === "string") {
                get_URL().revokeObjectURL(file);
            } else {
                file.remove();
            }
        }
        deletion_queue.length = 0; // clear queue
    }, dispatch = function(filesaver, event_types, event) {
        event_types = [].concat(event_types);
        var i = event_types.length;
        while(i--){
            var listener = filesaver["on" + event_types[i]];
            if (typeof listener === "function") {
                try {
                    listener.call(filesaver, event || filesaver);
                } catch (ex) {
                    throw_outside(ex);
                }
            }
        }
    }, FileSaver = function(blob, name) {
        // First try a.download, then web filesystem, then object URLs
        var filesaver = this, type = blob.type, blob_changed = false, object_url, target_view, get_object_url = function() {
            var object_url = get_URL().createObjectURL(blob);
            deletion_queue.push(object_url);
            return object_url;
        }, dispatch_all = function() {
            dispatch(filesaver, "writestart progress write writeend".split(" "));
        }, fs_error = function() {
            // don't create more object URLs than needed
            if (blob_changed || !object_url) {
                object_url = get_object_url(blob);
            }
            if (target_view) {
                target_view.location.href = object_url;
            } else {
                window.open(object_url, "_blank");
            }
            filesaver.readyState = filesaver.DONE;
            dispatch_all();
        }, abortable = function(func) {
            return function() {
                if (filesaver.readyState !== filesaver.DONE) {
                    return func.apply(this, arguments);
                }
            };
        }, create_if_not_found = {
            create: true,
            exclusive: false
        }, slice;
        filesaver.readyState = filesaver.INIT;
        if (!name) {
            name = "download";
        }
        if (can_use_save_link) {
            object_url = get_object_url(blob);
            save_link.href = object_url;
            save_link.download = name;
            click(save_link);
            filesaver.readyState = filesaver.DONE;
            dispatch_all();
            return;
        }
        // Object and web filesystem URLs have a problem saving in Google Chrome when
        // viewed in a tab, so I force save with application/octet-stream
        // http://code.google.com/p/chromium/issues/detail?id=91158
        if (view.chrome && type && type !== force_saveable_type) {
            slice = blob.slice || blob.webkitSlice;
            blob = slice.call(blob, 0, blob.size, force_saveable_type);
            blob_changed = true;
        }
        // Since I can't be sure that the guessed media type will trigger a download
        // in WebKit, I append .download to the filename.
        // https://bugs.webkit.org/show_bug.cgi?id=65440
        if (webkit_req_fs && name !== "download") {
            name += ".download";
        }
        if (type === force_saveable_type || webkit_req_fs) {
            target_view = view;
        }
        if (!req_fs) {
            fs_error();
            return;
        }
        fs_min_size += blob.size;
        req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
            fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
                var save = function() {
                    dir.getFile(name, create_if_not_found, abortable(function(file) {
                        file.createWriter(abortable(function(writer) {
                            writer.onwriteend = function(event) {
                                target_view.location.href = file.toURL();
                                deletion_queue.push(file);
                                filesaver.readyState = filesaver.DONE;
                                dispatch(filesaver, "writeend", event);
                            };
                            writer.onerror = function() {
                                var error = writer.error;
                                if (error.code !== error.ABORT_ERR) {
                                    fs_error();
                                }
                            };
                            "writestart progress write abort".split(" ").forEach(function(event) {
                                writer["on" + event] = filesaver["on" + event];
                            });
                            writer.write(blob);
                            filesaver.abort = function() {
                                writer.abort();
                                filesaver.readyState = filesaver.DONE;
                            };
                            filesaver.readyState = filesaver.WRITING;
                        }), fs_error);
                    }), fs_error);
                };
                dir.getFile(name, {
                    create: false
                }, abortable(function(file) {
                    // delete file if it already exists
                    file.remove();
                    save();
                }), abortable(function(ex) {
                    if (ex.code === ex.NOT_FOUND_ERR) {
                        save();
                    } else {
                        fs_error();
                    }
                }));
            }), fs_error);
        }), fs_error);
    }, FS_proto = FileSaver.prototype, saveAs = function(blob, name) {
        return new FileSaver(blob, name);
    };
    FS_proto.abort = function() {
        var filesaver = this;
        filesaver.readyState = filesaver.DONE;
        dispatch(filesaver, "abort");
    };
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;
    FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;
    view.addEventListener("unload", process_deletion_queue, false);
    saveAs.unload = function() {
        process_deletion_queue();
        view.removeEventListener("unload", process_deletion_queue, false);
    };
    return saveAs;
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content);
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window
if (typeof module !== "undefined" && module !== null) {
    module.exports = saveAs;
} else if (typeof define !== "undefined" && define !== null && define.amd != null) {
    define([], function() {
        return saveAs;
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvRmlsZVNhdmVyLWI4MDU0YTIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogRmlsZVNhdmVyLmpzXG4gKiAgQSBzYXZlQXMoKSBGaWxlU2F2ZXIgaW1wbGVtZW50YXRpb24uXG4gKiAgMjAxNC0wNS0yN1xuICpcbiAqICBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiAgTGljZW5zZTogWDExL01JVFxuICogICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbGlncmV5L0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4gKi9cblxuLypnbG9iYWwgc2VsZiAqL1xuLypqc2xpbnQgYml0d2lzZTogdHJ1ZSwgaW5kZW50OiA0LCBsYXhicmVhazogdHJ1ZSwgbGF4Y29tbWE6IHRydWUsIHNtYXJ0dGFiczogdHJ1ZSwgcGx1c3BsdXM6IHRydWUgKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cblxudmFyIHNhdmVBcyA9IHNhdmVBc1xuICAvLyBJRSAxMCsgKG5hdGl2ZSBzYXZlQXMpXG4gIHx8ICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYiAmJiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYi5iaW5kKG5hdmlnYXRvcikpXG4gIC8vIEV2ZXJ5b25lIGVsc2VcbiAgfHwgKGZ1bmN0aW9uKHZpZXcpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIC8vIElFIDwxMCBpcyBleHBsaWNpdGx5IHVuc3VwcG9ydGVkXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXJcbiAgICAgIGRvYyA9IHZpZXcuZG9jdW1lbnRcbiAgICAgIC8vIG9ubHkgZ2V0IFVSTCB3aGVuIG5lY2Vzc2FyeSBpbiBjYXNlIEJsb2IuanMgaGFzbid0IG92ZXJyaWRkZW4gaXQgeWV0XG4gICAgLCBnZXRfVVJMID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdmlldy5VUkwgfHwgdmlldy53ZWJraXRVUkwgfHwgdmlldztcbiAgICB9XG4gICAgLCBzYXZlX2xpbmsgPSBkb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLCBcImFcIilcbiAgICAsIGNhbl91c2Vfc2F2ZV9saW5rID0gIXZpZXcuZXh0ZXJuYWxIb3N0ICYmIFwiZG93bmxvYWRcIiBpbiBzYXZlX2xpbmtcbiAgICAsIGNsaWNrID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIGV2ZW50ID0gZG9jLmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudHNcIik7XG4gICAgICBldmVudC5pbml0TW91c2VFdmVudChcbiAgICAgICAgXCJjbGlja1wiLCB0cnVlLCBmYWxzZSwgdmlldywgMCwgMCwgMCwgMCwgMFxuICAgICAgICAsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLCBudWxsXG4gICAgICApO1xuICAgICAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICB9XG4gICAgLCB3ZWJraXRfcmVxX2ZzID0gdmlldy53ZWJraXRSZXF1ZXN0RmlsZVN5c3RlbVxuICAgICwgcmVxX2ZzID0gdmlldy5yZXF1ZXN0RmlsZVN5c3RlbSB8fCB3ZWJraXRfcmVxX2ZzIHx8IHZpZXcubW96UmVxdWVzdEZpbGVTeXN0ZW1cbiAgICAsIHRocm93X291dHNpZGUgPSBmdW5jdGlvbihleCkge1xuICAgICAgKHZpZXcuc2V0SW1tZWRpYXRlIHx8IHZpZXcuc2V0VGltZW91dCkoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfSwgMCk7XG4gICAgfVxuICAgICwgZm9yY2Vfc2F2ZWFibGVfdHlwZSA9IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCJcbiAgICAsIGZzX21pbl9zaXplID0gMFxuICAgICwgZGVsZXRpb25fcXVldWUgPSBbXVxuICAgICwgcHJvY2Vzc19kZWxldGlvbl9xdWV1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSBkZWxldGlvbl9xdWV1ZS5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHZhciBmaWxlID0gZGVsZXRpb25fcXVldWVbaV07XG4gICAgICAgIGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcbiAgICAgICAgICBnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuICAgICAgICB9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuICAgICAgICAgIGZpbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlbGV0aW9uX3F1ZXVlLmxlbmd0aCA9IDA7IC8vIGNsZWFyIHF1ZXVlXG4gICAgfVxuICAgICwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuICAgICAgZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuICAgICAgdmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcbiAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgdGhyb3dfb3V0c2lkZShleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgICwgRmlsZVNhdmVyID0gZnVuY3Rpb24oYmxvYiwgbmFtZSkge1xuICAgICAgLy8gRmlyc3QgdHJ5IGEuZG93bmxvYWQsIHRoZW4gd2ViIGZpbGVzeXN0ZW0sIHRoZW4gb2JqZWN0IFVSTHNcbiAgICAgIHZhclxuICAgICAgICAgIGZpbGVzYXZlciA9IHRoaXNcbiAgICAgICAgLCB0eXBlID0gYmxvYi50eXBlXG4gICAgICAgICwgYmxvYl9jaGFuZ2VkID0gZmFsc2VcbiAgICAgICAgLCBvYmplY3RfdXJsXG4gICAgICAgICwgdGFyZ2V0X3ZpZXdcbiAgICAgICAgLCBnZXRfb2JqZWN0X3VybCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICBkZWxldGlvbl9xdWV1ZS5wdXNoKG9iamVjdF91cmwpO1xuICAgICAgICAgIHJldHVybiBvYmplY3RfdXJsO1xuICAgICAgICB9XG4gICAgICAgICwgZGlzcGF0Y2hfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgd3JpdGVlbmRcIi5zcGxpdChcIiBcIikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG9uIGFueSBmaWxlc3lzIGVycm9ycyByZXZlcnQgdG8gc2F2aW5nIHdpdGggb2JqZWN0IFVSTHNcbiAgICAgICAgLCBmc19lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIGRvbid0IGNyZWF0ZSBtb3JlIG9iamVjdCBVUkxzIHRoYW4gbmVlZGVkXG4gICAgICAgICAgaWYgKGJsb2JfY2hhbmdlZCB8fCAhb2JqZWN0X3VybCkge1xuICAgICAgICAgICAgb2JqZWN0X3VybCA9IGdldF9vYmplY3RfdXJsKGJsb2IpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGFyZ2V0X3ZpZXcpIHtcbiAgICAgICAgICAgIHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aW5kb3cub3BlbihvYmplY3RfdXJsLCBcIl9ibGFua1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcbiAgICAgICAgICBkaXNwYXRjaF9hbGwoKTtcbiAgICAgICAgfVxuICAgICAgICAsIGFib3J0YWJsZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZmlsZXNhdmVyLnJlYWR5U3RhdGUgIT09IGZpbGVzYXZlci5ET05FKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICAsIGNyZWF0ZV9pZl9ub3RfZm91bmQgPSB7Y3JlYXRlOiB0cnVlLCBleGNsdXNpdmU6IGZhbHNlfVxuICAgICAgICAsIHNsaWNlXG4gICAgICA7XG4gICAgICBmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIG5hbWUgPSBcImRvd25sb2FkXCI7XG4gICAgICB9XG4gICAgICBpZiAoY2FuX3VzZV9zYXZlX2xpbmspIHtcbiAgICAgICAgb2JqZWN0X3VybCA9IGdldF9vYmplY3RfdXJsKGJsb2IpO1xuICAgICAgICBzYXZlX2xpbmsuaHJlZiA9IG9iamVjdF91cmw7XG4gICAgICAgIHNhdmVfbGluay5kb3dubG9hZCA9IG5hbWU7XG4gICAgICAgIGNsaWNrKHNhdmVfbGluayk7XG4gICAgICAgIGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG4gICAgICAgIGRpc3BhdGNoX2FsbCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBPYmplY3QgYW5kIHdlYiBmaWxlc3lzdGVtIFVSTHMgaGF2ZSBhIHByb2JsZW0gc2F2aW5nIGluIEdvb2dsZSBDaHJvbWUgd2hlblxuICAgICAgLy8gdmlld2VkIGluIGEgdGFiLCBzbyBJIGZvcmNlIHNhdmUgd2l0aCBhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cbiAgICAgIC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkxMTU4XG4gICAgICBpZiAodmlldy5jaHJvbWUgJiYgdHlwZSAmJiB0eXBlICE9PSBmb3JjZV9zYXZlYWJsZV90eXBlKSB7XG4gICAgICAgIHNsaWNlID0gYmxvYi5zbGljZSB8fCBibG9iLndlYmtpdFNsaWNlO1xuICAgICAgICBibG9iID0gc2xpY2UuY2FsbChibG9iLCAwLCBibG9iLnNpemUsIGZvcmNlX3NhdmVhYmxlX3R5cGUpO1xuICAgICAgICBibG9iX2NoYW5nZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gU2luY2UgSSBjYW4ndCBiZSBzdXJlIHRoYXQgdGhlIGd1ZXNzZWQgbWVkaWEgdHlwZSB3aWxsIHRyaWdnZXIgYSBkb3dubG9hZFxuICAgICAgLy8gaW4gV2ViS2l0LCBJIGFwcGVuZCAuZG93bmxvYWQgdG8gdGhlIGZpbGVuYW1lLlxuICAgICAgLy8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTY1NDQwXG4gICAgICBpZiAod2Via2l0X3JlcV9mcyAmJiBuYW1lICE9PSBcImRvd25sb2FkXCIpIHtcbiAgICAgICAgbmFtZSArPSBcIi5kb3dubG9hZFwiO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGZvcmNlX3NhdmVhYmxlX3R5cGUgfHwgd2Via2l0X3JlcV9mcykge1xuICAgICAgICB0YXJnZXRfdmlldyA9IHZpZXc7XG4gICAgICB9XG4gICAgICBpZiAoIXJlcV9mcykge1xuICAgICAgICBmc19lcnJvcigpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmc19taW5fc2l6ZSArPSBibG9iLnNpemU7XG4gICAgICByZXFfZnModmlldy5URU1QT1JBUlksIGZzX21pbl9zaXplLCBhYm9ydGFibGUoZnVuY3Rpb24oZnMpIHtcbiAgICAgICAgZnMucm9vdC5nZXREaXJlY3RvcnkoXCJzYXZlZFwiLCBjcmVhdGVfaWZfbm90X2ZvdW5kLCBhYm9ydGFibGUoZnVuY3Rpb24oZGlyKSB7XG4gICAgICAgICAgdmFyIHNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRpci5nZXRGaWxlKG5hbWUsIGNyZWF0ZV9pZl9ub3RfZm91bmQsIGFib3J0YWJsZShmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgICAgIGZpbGUuY3JlYXRlV3JpdGVyKGFib3J0YWJsZShmdW5jdGlvbih3cml0ZXIpIHtcbiAgICAgICAgICAgICAgICB3cml0ZXIub253cml0ZWVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICB0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gZmlsZS50b1VSTCgpO1xuICAgICAgICAgICAgICAgICAgZGVsZXRpb25fcXVldWUucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICAgIGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG4gICAgICAgICAgICAgICAgICBkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVlbmRcIiwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgd3JpdGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IHdyaXRlci5lcnJvcjtcbiAgICAgICAgICAgICAgICAgIGlmIChlcnJvci5jb2RlICE9PSBlcnJvci5BQk9SVF9FUlIpIHtcbiAgICAgICAgICAgICAgICAgICAgZnNfZXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICB3cml0ZXJbXCJvblwiICsgZXZlbnRdID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50XTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB3cml0ZXIud3JpdGUoYmxvYik7XG4gICAgICAgICAgICAgICAgZmlsZXNhdmVyLmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICB3cml0ZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5XUklUSU5HO1xuICAgICAgICAgICAgICB9KSwgZnNfZXJyb3IpO1xuICAgICAgICAgICAgfSksIGZzX2Vycm9yKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGRpci5nZXRGaWxlKG5hbWUsIHtjcmVhdGU6IGZhbHNlfSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZSBmaWxlIGlmIGl0IGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICBmaWxlLnJlbW92ZSgpO1xuICAgICAgICAgICAgc2F2ZSgpO1xuICAgICAgICAgIH0pLCBhYm9ydGFibGUoZnVuY3Rpb24oZXgpIHtcbiAgICAgICAgICAgIGlmIChleC5jb2RlID09PSBleC5OT1RfRk9VTkRfRVJSKSB7XG4gICAgICAgICAgICAgIHNhdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGZzX2Vycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9KSwgZnNfZXJyb3IpO1xuICAgICAgfSksIGZzX2Vycm9yKTtcbiAgICB9XG4gICAgLCBGU19wcm90byA9IEZpbGVTYXZlci5wcm90b3R5cGVcbiAgICAsIHNhdmVBcyA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUpIHtcbiAgICAgIHJldHVybiBuZXcgRmlsZVNhdmVyKGJsb2IsIG5hbWUpO1xuICAgIH1cbiAgO1xuICBGU19wcm90by5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaWxlc2F2ZXIgPSB0aGlzO1xuICAgIGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG4gICAgZGlzcGF0Y2goZmlsZXNhdmVyLCBcImFib3J0XCIpO1xuICB9O1xuICBGU19wcm90by5yZWFkeVN0YXRlID0gRlNfcHJvdG8uSU5JVCA9IDA7XG4gIEZTX3Byb3RvLldSSVRJTkcgPSAxO1xuICBGU19wcm90by5ET05FID0gMjtcblxuICBGU19wcm90by5lcnJvciA9XG4gIEZTX3Byb3RvLm9ud3JpdGVzdGFydCA9XG4gIEZTX3Byb3RvLm9ucHJvZ3Jlc3MgPVxuICBGU19wcm90by5vbndyaXRlID1cbiAgRlNfcHJvdG8ub25hYm9ydCA9XG4gIEZTX3Byb3RvLm9uZXJyb3IgPVxuICBGU19wcm90by5vbndyaXRlZW5kID1cbiAgICBudWxsO1xuXG4gIHZpZXcuYWRkRXZlbnRMaXN0ZW5lcihcInVubG9hZFwiLCBwcm9jZXNzX2RlbGV0aW9uX3F1ZXVlLCBmYWxzZSk7XG4gIHNhdmVBcy51bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBwcm9jZXNzX2RlbGV0aW9uX3F1ZXVlKCk7XG4gICAgdmlldy5yZW1vdmVFdmVudExpc3RlbmVyKFwidW5sb2FkXCIsIHByb2Nlc3NfZGVsZXRpb25fcXVldWUsIGZhbHNlKTtcbiAgfTtcbiAgcmV0dXJuIHNhdmVBcztcbn0oXG4gICAgIHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGZcbiAgfHwgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3dcbiAgfHwgdGhpcy5jb250ZW50XG4pKTtcbi8vIGBzZWxmYCBpcyB1bmRlZmluZWQgaW4gRmlyZWZveCBmb3IgQW5kcm9pZCBjb250ZW50IHNjcmlwdCBjb250ZXh0XG4vLyB3aGlsZSBgdGhpc2AgaXMgbnNJQ29udGVudEZyYW1lTWVzc2FnZU1hbmFnZXJcbi8vIHdpdGggYW4gYXR0cmlidXRlIGBjb250ZW50YCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB3aW5kb3dcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gc2F2ZUFzO1xufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmUgIT09IG51bGwpICYmIChkZWZpbmUuYW1kICE9IG51bGwpKSB7XG4gIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNhdmVBcztcbiAgfSk7XG59XG4iXSwibmFtZXMiOlsic2F2ZUFzIiwibmF2aWdhdG9yIiwibXNTYXZlT3JPcGVuQmxvYiIsImJpbmQiLCJ2aWV3IiwidGVzdCIsInVzZXJBZ2VudCIsImRvYyIsImRvY3VtZW50IiwiZ2V0X1VSTCIsIlVSTCIsIndlYmtpdFVSTCIsInNhdmVfbGluayIsImNyZWF0ZUVsZW1lbnROUyIsImNhbl91c2Vfc2F2ZV9saW5rIiwiZXh0ZXJuYWxIb3N0IiwiY2xpY2siLCJub2RlIiwiZXZlbnQiLCJjcmVhdGVFdmVudCIsImluaXRNb3VzZUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsIndlYmtpdF9yZXFfZnMiLCJ3ZWJraXRSZXF1ZXN0RmlsZVN5c3RlbSIsInJlcV9mcyIsInJlcXVlc3RGaWxlU3lzdGVtIiwibW96UmVxdWVzdEZpbGVTeXN0ZW0iLCJ0aHJvd19vdXRzaWRlIiwiZXgiLCJzZXRJbW1lZGlhdGUiLCJzZXRUaW1lb3V0IiwiZm9yY2Vfc2F2ZWFibGVfdHlwZSIsImZzX21pbl9zaXplIiwiZGVsZXRpb25fcXVldWUiLCJwcm9jZXNzX2RlbGV0aW9uX3F1ZXVlIiwiaSIsImxlbmd0aCIsImZpbGUiLCJyZXZva2VPYmplY3RVUkwiLCJyZW1vdmUiLCJkaXNwYXRjaCIsImZpbGVzYXZlciIsImV2ZW50X3R5cGVzIiwiY29uY2F0IiwibGlzdGVuZXIiLCJjYWxsIiwiRmlsZVNhdmVyIiwiYmxvYiIsIm5hbWUiLCJ0eXBlIiwiYmxvYl9jaGFuZ2VkIiwib2JqZWN0X3VybCIsInRhcmdldF92aWV3IiwiZ2V0X29iamVjdF91cmwiLCJjcmVhdGVPYmplY3RVUkwiLCJwdXNoIiwiZGlzcGF0Y2hfYWxsIiwic3BsaXQiLCJmc19lcnJvciIsImxvY2F0aW9uIiwiaHJlZiIsIndpbmRvdyIsIm9wZW4iLCJyZWFkeVN0YXRlIiwiRE9ORSIsImFib3J0YWJsZSIsImZ1bmMiLCJhcHBseSIsImFyZ3VtZW50cyIsImNyZWF0ZV9pZl9ub3RfZm91bmQiLCJjcmVhdGUiLCJleGNsdXNpdmUiLCJzbGljZSIsIklOSVQiLCJkb3dubG9hZCIsImNocm9tZSIsIndlYmtpdFNsaWNlIiwic2l6ZSIsIlRFTVBPUkFSWSIsImZzIiwicm9vdCIsImdldERpcmVjdG9yeSIsImRpciIsInNhdmUiLCJnZXRGaWxlIiwiY3JlYXRlV3JpdGVyIiwid3JpdGVyIiwib253cml0ZWVuZCIsInRvVVJMIiwib25lcnJvciIsImVycm9yIiwiY29kZSIsIkFCT1JUX0VSUiIsImZvckVhY2giLCJ3cml0ZSIsImFib3J0IiwiV1JJVElORyIsIk5PVF9GT1VORF9FUlIiLCJGU19wcm90byIsInByb3RvdHlwZSIsIm9ud3JpdGVzdGFydCIsIm9ucHJvZ3Jlc3MiLCJvbndyaXRlIiwib25hYm9ydCIsImFkZEV2ZW50TGlzdGVuZXIiLCJ1bmxvYWQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic2VsZiIsImNvbnRlbnQiLCJtb2R1bGUiLCJleHBvcnRzIiwiZGVmaW5lIiwiYW1kIl0sIm1h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