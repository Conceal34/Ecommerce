function calcTotal() {
    let subtotal = 0;

    if ($(".item-in-cart").length == 1) {
        let price = Number(($(".price").html()).slice(8));
        let qty = Number(document.querySelectorAll(".qty-num")[0].innerHTML);
        subtotal += price * qty;
    } else {
        for (let i = 0; i < $(".item-in-cart").length; i++) {
            let price = Number((document.querySelectorAll(".price")[i].innerHTML).slice(8));
            let qty = Number(document.querySelectorAll(".qty-num")[i].innerHTML);
            subtotal += price * qty;
        }
    }
    $("#subTotal").val(subtotal);
    $(".subTotal").html("SubTotal: $" + subtotal);
    // sends the cart to server everytime the qty changes.
}


setTimeout(calcTotal(), 10000);
