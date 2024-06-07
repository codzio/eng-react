"use strict";
var KTAppEcommerceCategories = (function () {
    var t,
        e,
        n = () => {
            t.querySelectorAll('[data-kt-ecommerce-blog-filter="delete_row"]').forEach((t) => {
                t.addEventListener("click", function (t) {
                    t.preventDefault();
                    
                    const n = t.target.closest("tr"),
                        o = n.querySelector('[data-kt-ecommerce-blog-filter="blog_name"]').innerText,
                        el = n.querySelector('[data-kt-ecommerce-blog-filter="delete_row"]');
                       
                    Swal.fire({
                        text: "Are you sure you want to delete " + o + "?",
                        icon: "warning",
                        showCancelButton: !0,
                        buttonsStyling: !1,
                        confirmButtonText: "Yes, delete!",
                        cancelButtonText: "No, cancel",
                        customClass: { confirmButton: "btn fw-bold btn-danger", cancelButton: "btn fw-bold btn-active-light-primary" },
                    }).then(function (t) {

                    	$.ajax({
                        	url: '/admin/blogs/delete',
                        	type: 'POST',
                        	dataType: 'json',
                        	data: {
                        		id: el.dataset.id,
                        		_csrf: el.dataset.csrf,
                        	},
                        	beforeSend: function() {
			                    //$("#kt_ecommerce_add_category_form .removeErr").html('');
			                    //$("#kt_ecommerce_add_category_form .indicator-label").hide();
			                    //$("#kt_ecommerce_add_category_form .indicator-progress").show();
			                },
			                success: function (succRes) {
			                    // location.reload();
			                    Swal.fire({ 
			                        text: succRes.msg, 
			                        icon: "success", 
			                        buttonsStyling: !1, 
			                        confirmButtonText: "Ok, got it!", 
			                        customClass: { confirmButton: "btn btn-success" },
			                        showCloseButton: false,
			                        showCancelButton: false,
			                        showConfirmButton: true,
			                        // position: 'top-end',
			                        timer: 2500,
			                        timerProgressBar: true,
			                    });

			                    e.row($(n)).remove().draw();

			                    //$("#kt_ecommerce_add_category_form .indicator-label").show();
			                    //$("#kt_ecommerce_add_category_form .indicator-progress").hide();
			                },
			                error: function (jqXHR, exception) {
			                    errResp = jqXHR.responseJSON;
			                    
			                    if (errResp.eType == 'field') {
			                        //field error
			                        $.each(errResp.errors, function(index, field) {
			                            if (field.path == '_csrf') {
			                                alert(field.msg);
			                            } else {
			                                $(`#${field.path}Err`).html(field.msg);
			                            }
			                        });
			                    } else {
			                        //final error
			                        Swal.fire({ 
			                            text: errResp.msg, 
			                            icon: "error", 
			                            buttonsStyling: !1, 
			                            confirmButtonText: "Ok, got it!", 
			                            customClass: { confirmButton: "btn btn-danger" },
			                            showCloseButton: false,
			                            showCancelButton: false,
			                            showConfirmButton: true,
			                            // position: 'top-end',
			                            timer: 2500,
			                            timerProgressBar: true,
			                        });
			                    }

			                    //$("#kt_ecommerce_add_category_form .indicator-label").show();
			                    //$("#kt_ecommerce_add_category_form .indicator-progress").hide();
			                }
                        })
                    	

                        // t.value
                        //     ? Swal.fire({ text: "You have deleted " + o + "!.", icon: "success", buttonsStyling: !1, confirmButtonText: "Ok, got it!", customClass: { confirmButton: "btn fw-bold btn-primary" } }).then(function () {
                        //           e.row($(n)).remove().draw();
                        //       })
                        //     : "cancel" === t.dismiss && Swal.fire({ text: o + " was not deleted.", icon: "error", buttonsStyling: !1, confirmButtonText: "Ok, got it!", customClass: { confirmButton: "btn fw-bold btn-primary" } });
                    });
                });
            });
        };
    return {
        init: function () {
            (t = document.querySelector("#kt_ecommerce_blogs_table")) &&
                ((e = $(t).DataTable({
                    info: !1,
                    order: [],
                    pageLength: 10,
                    columnDefs: [
                        { orderable: !1, targets: 0 },
                        { orderable: !1, targets: 2 },
                    ],
                })).on("draw", function () {
                    n();
                }),
                document.querySelector('[data-kt-ecommerce-blog-filter="search"]').addEventListener("keyup", function (t) {
                    e.search(t.target.value).draw();
                }),
                n());
        },
    };
})();
KTUtil.onDOMContentLoaded(function () {
    KTAppEcommerceCategories.init();
});
