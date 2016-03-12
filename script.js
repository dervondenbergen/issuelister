function issuelister (config) {

  var DEBUG = config.debug || false;
  var DATETIMEFORMAT = config.datetimeformat || 'DD.MM.YYYY HH:mm';
  var type = config.type;
  var name = config.name;
  
  if (type == undefined || name == undefined) {
    var error = document.createElement('div');
    error.textContent = 'To use Issue Lister propperly, you have to set up at least a GitHub type and GitHub name. You find the instructions in the README.md file.';
    error.style.padding = '1em';
    error.style.backgroundColor = 'lightcoral';
    error.style.color = 'darkred';
    error.style.border = '0.2em solid darkred';
    error.style.margin = '1em';
    document.body.appendChild(error);
    return;
  }
  
  var listSource   = document.querySelector('#list-template').innerHTML;
  var listTemplate = Handlebars.compile(listSource);
  
  var detailSource   = document.querySelector('#detail-template').innerHTML;
  var detailTemplate = Handlebars.compile(detailSource);
  
  var issuelist = document.querySelector('.issues');
  var detail = document.querySelector('.detail');
  var detailoverlay = document.querySelector('.detailoverlay');
  
  var repos = 'https://api.github.com/' + config.type + '/' + config.name + '/repos?per_page=100';

  
  var allissues = {};
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', repos);
  xhr.send();
  
  xhr.onload = handleResponse;
  
  function handleResponse () {
    
    var repos = JSON.parse(xhr.responseText);
    
    clog(repos);
    
    for (var i = 0; i < repos.length; i++) {
      
      var repo = repos[i];
      
      clog(repo);
      
      if (repo.open_issues_count > 0) {
        
        getIssues(repo.url)
        
      }
      
    }
    
  }
  
  function getIssues(repourl) {
    
    var issueXhr = new XMLHttpRequest();
    issueXhr.open('GET', repourl+'/issues');
    issueXhr.send();
    issueXhr.onload = function () {
      
      var issues =  JSON.parse(issueXhr.responseText);
      
      handleIssues(issues);
      
    }
    
  }
  
  function handleIssues(issues) {
      
    for (var i = 0; i < issues.length; i++) {
      
      var issue = issues[i];
      
      var isPullRequest = (issue.pull_request) ? true : false;
            
      handleIssue(issue, isPullRequest);
      
    }
    
  }
  
  function handleIssue(issue, isPullRequest) {
    
    var id = issue.id;
    
    var time = moment(issue.created_at).format(DATETIMEFORMAT);
    var type = (isPullRequest) ? 'pr' : 'i';
    
    issue.type = type;
    allissues[id] = issue;
    
    var data = {
      id: id,
      repo: getRepoName( issue.url ),
      title: issue.title,
      author: issue.user.login,
      time: time,
      type: type
    };
    
    issuelist.innerHTML += listTemplate(data);
    
    clog(issue);
    
  }
    
  function getRepoName (url) {
    
    var u = url.split('/');
    u.pop();
    u.pop();
    
    var repo = u.pop();
    var user = u.pop();
    
    return [user, repo].join('/');
    
  }
  
  function clog (anything) {
    
    if (DEBUG) {
      console.log(anything);
    }
    
  }
  
  window.onhashchange = hashChanged;
  
  function hashChanged (e) {
    
    e.preventDefault();
    
    var hash = window.location.hash.split('/');
    
    clog(hash);
    
    if (hash[1] == 'id') {
      
      var id = hash[2];
      showIssueInDetail(id);
      
    } else {
      
      hideDetail();
      emptyDetail();
      
    }
    
  }
  
  function showIssueInDetail (id) {
    
    var issue = allissues[id];
    
    var time = moment(issue.created_at).format(DATETIMEFORMAT);
    
    var writtentype = (issue.type == 'i') ? 'Issue' : 'Pull Request';
    
    var repo = getRepoName( issue.url );
    var repourl = ['https://github.com', repo].join('/');
    
    var body = marked(issue.body);
    
    var labels = [];
    
    for (var i = 0; i < issue.labels.length; i++) {
      
      var label = issue.labels[i];
      
      var u = label.url.split('/');
      var p = [];
      
      p.push(u.pop());
      p.push(u.pop());
      p.push(u.pop());
      p.push(u.pop());
      p.push('https://github.com');
      
      p.sort(function(){
        return 1
      });
      
      label.url = p.join('/');
      
      labels.push(label);
      
    }
    
    var data = {
      id: id,
      repo: repo,
      title: issue.title,
      author: issue.user.login,
      time: time,
      type: issue.type,
      writtentype: writtentype,
      url: issue.html_url,
      issuenumber: issue.number,
      repourl: repourl,
      description: body,
      authorlink: issue.user.html_url,
      labels: labels
    };
    
    clog(labels)
    
    fillDetail(detailTemplate(data));
    
    showDetail();
    
    if (DEBUG) fillDetail('<pre>'+JSON.stringify(issue, null, 2)+'</pre>');
    
  }
  
  function showDetail() {
    
    document.body.classList.add('blocked');
    detail.classList.add('visible');
    detail.scrollTop = 0;
    detailoverlay.classList.add('visible');
    detailoverlay.classList.add('unhidden');
    
  }
  
  function hideDetail () {
    
    document.body.classList.remove('blocked');
    detail.classList.remove('visible');
    detailoverlay.classList.remove('visible');
    setTimeout(function () {
      detailoverlay.classList.remove('unhidden');
    }, 500);
    
  }
  
  function fillDetail (html) {
    
    detail.innerHTML += html;
    
  }
  
  function emptyDetail () {
    
    detail.innerHTML = '';
    
  }
  
  detailoverlay.onclick = exitDetail;
  
  document.onkeydown = function (e) {
    
    if (e.keyCode == 27) {
      exitDetail();
    }
    
  }
  
  function exitDetail () {
    
    window.location.hash = '#/';
    
  }
  
}
