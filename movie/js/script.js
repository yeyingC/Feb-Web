var token;
var products = [];
var productsMap = {};
var cart = {};


function getCookie(name) {   // helper function 
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if(parts.length == 2) return parts.pop().split(";").shift();
}

function deleteCookie(name){
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'; 
}

function updateCartModel() {
	if(getCookie('cart')) {
      var persistedCart = JSON.parse(getCookie('cart'));
      for(var key in persistedCart) {
      	if(!(key in productsMap)) {
      		delete persistedCart.key;
      	}
      }
      cart = persistedCart;
      document.cookie = 'cart=' + JSON.stringify(cart);
	} else {
		cart = {};
	}
}

function updateView() {
	updateCartModel();
	if(token) {
		$("#loginNav").hide();
		$("#logoutNav").show();
	} else {
		$("#loginNav").show();
		$("#logoutNav").hide();
	}
	if(Object.keys(cart).length === 0) {
		$("#cartNav").hide();
	} else {
		$("#cartNav").show();
	}
}

function updateProductsMap() {
	products.forEach(function(product){
		productsMap[product._id] = product;
	});
}




function updateProductsView() {
	for (var i = 0; i < products.length; i++) {
		var nameTd = '<td>' + products[i].name + '</td>';
		var priceTd = '<td>' + products[i].price + '</td>';
		var stockTd = '<td>' + products[i].stock + '</td>';
		if(products[i].stock > 0) {
			var purchaseTd = '<td><button class="btn btn-primary btn-purchase" id="' + products[i]._id + '">Purchase</button></td>';
			} else {
				var purchaseTd = '<td><button class="btn" disable = "true">Not Available</button></td>';
			}
			$('<tr>').html(nameTd + priceTd + stockTd + purchaseTd).appendTo("#product-table");
		}
		$(".btn-purchase").click(function(event) {
            alert("product added to shopping cart");
            var productId = $(event.target).attr('id');
            cart[productId] = 1;
            document.cookie = "cart=" + JSON.stringify(cart);
            updateView();
		});
		updateCartView();
}

function updateCartView() {
    if (Object.keys(cart).length === 0 || products.length === 0 || $('.shopping-cart').length === 0) {
        return;
    }

    for (var key in cart) {
        var button =  '<div class="buttons"><span class="delete-btn"></span></div>';
        var image = '<div><img class="product-image" src="' + productsMap[key].imageUrl + '" alt="" /></div>';
        var description = '<div class="description"><span>'+productsMap[key].name+'</span><span>'+productsMap[key].description+'</span><span>White</span></div>';
        var quantity = '<div class="quantity"><button class="plus-btn" type="button" name="button"><img src="plus.svg" alt="" /></button><input type="text" name="name" value="1"><button class="minus-btn" type="button" name="button"><img src="minus.svg" alt="" /></button></div>';
        var price = '<div class="total-price">'+productsMap[key].price+'</div>'
        var item = '<div class="item">' + button + image + description + quantity + price + '</div>';
        $('.shopping-cart').append(item);
    }

}

function getProducts() {
	if(!token) 
		return;
	$.ajax({
		url:"http://open-commerce.herokuapp.com/api/products",
		type:"GET",
		data:{
			'token':token
		},
		success: function(res) {
 			products = res;
 			updateProductsMap();
 			updateProductsView();
 			console.log(res)
		},
		error: function(err){
			alert(err);
		}
	});
}

$(document).ready(function(event) { //garantee HTML 已经ready
    token = getCookie('x-access-token');
    getProducts();
    updateView();
    $("#logoutNav").click(function(event) {
    	event.preventDefault();
    	deleteCookie('x-access-token');
    	deleteCookie('cart');
    	token = null; 
    	updateView();
    	window.location.href = "/movie/index.html";
    })

    $("#loginBtn").click(function(event) {
            event.preventDefault();
            var username = $("#username").val();
            var password = $("#password").val();
            if(username && password) {
            	$.post("http://open-commerce.herokuapp.com/api/login",
            	{
            		username: username,
                	password: password	
            	},
            	function(res) {
            		if(res.success) {
            			alert("login success");
            			var cookie = 'x-access-token=' + res.token; 
            			document.cookie = cookie;
            			window.location.href = "/movie/index.html";
            			} else {
            			alert(res.message);
            			}
            		}
				)}
             else {
            	alert("Please provide a username and password");
            }
    
    $("#signupBtn").click(function(event) {
            // console.log(event);
            event.preventDefault();
            var username = $("#username").val();
            var password = $("#password").val();
            if (username && password) {
                $.post(" http://open-commerce.herokuapp.com/api/signup", 
                	{
                        username: username,
                        password: password
                    },
                    function(res) {
                        if (res.success) {
                            alert("signup success");
                        } else {
                            alert(res.message);
                        }
                    }
                )} else {
            		alert("Enter username and password");
        		}

    });
});
}) // cilck event JQuery helper fn