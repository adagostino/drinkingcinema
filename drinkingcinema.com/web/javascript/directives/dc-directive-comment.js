var name = "directive.comment";
(function(name){
    var _months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var _formatDate = function(dateStr){
        if (!dateStr) return dateStr;
        dateStr = dateStr.replace(/(\d{4})-(\d{2})-(\d{2})/,function(match,$1,$2,$3){
            return $2 + "/" + $3 + "/" + $1;
        });
        var utc = new Date(dateStr),
            d = new Date(utc.getTime() - utc.getTimezoneOffset()*60*1000);

        return _months[d.getMonth()] + " " + d.getDate() + " at " + _formatTime(d);
    };

    var _formatTime = function(d){
        var hrs = d.getHours(),
            min = d.getMinutes(),
            ap = hrs >= 12 ? "pm" : "am";
        if (ap === "pm" && hrs !== 12) hrs-= 12;
        if (hrs === 0) hrs = 12;
        if (min < 10) min = "0" + min;
        return hrs+":"+min+ap;
    };

    var comment = function(){};

    comment.prototype.init = function(){
        this.comment.uploadDateFormatted = _formatDate(this.comment.uploadDate);
    };

    comment.prototype.flag = function(){

    };

    $dc.addDirective({
        name: name,
        directive: comment,
        template: "#dc-directive-comment-template",
        $scope: {
            'comment': 'comment'
        }
    });

})(name);