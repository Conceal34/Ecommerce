$(".image>img").hover(() => {
    $(".image>img").css("animation-play-state", "paused")
}, () => {
    $(".image>img").css("animation-play-state", "running")
});

let quantity = 1;
$(".qty")[0].value = quantity;
function decrease_qty() {
    if (quantity > 1) {
        quantity--;
        document.querySelector(".qty-num").innerHTML = quantity;
        $(".qty")[0].value--;
    }
}
function increase_qty() {
    quantity++;
    document.querySelector(".qty-num").innerHTML = quantity;
    $(".qty")[0].value++;
}
