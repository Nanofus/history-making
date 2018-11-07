new fullpage('#fullpage', {
	//options here
	autoScrolling:true,
    scrollHorizontally: true,
    licenseKey: "OPEN-SOURCE-GPLV3-LICENSE",

    afterLoad: (origin, destination, direction) => {
        console.log(origin, destination, direction);
    }
});

fullpage_api.setAllowScrolling(false, 'up');