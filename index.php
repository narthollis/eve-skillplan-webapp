<!DOCTYPE html>
<html>
    <head>
        <title>EVE Skillplan</title>

        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" type="text/css" href="lib/bootstrap/css/bootstrap.css" />
        <link rel="stylesheet" type="text/css" href="lib/bootstrap-glyphicons/css/bootstrap-glyphicons.css" />

        <link rel="stylesheet" type="text/css" href="src/css/defaults.css" />

        <link rel="stylesheet" type="text/css" href="src/css/character_overview.css" />
        <link rel="stylesheet" type="text/css" href="src/css/skill_browser.css" />

        <script type="text/javascript" src="lib/jquery-2.0.3.js"></script>
        <script type="text/javascript" src="lib/jquery.tinysort.min.js"></script>
        <script type="text/javascript" src="lib/bootstrap/js/bootstrap.js"></script>
        <script type="text/javascript" src="lib/romanize.js"></script>

        <script type="text/javascript" src="ccp/skills.json"></script>

        <script type="text/javascript" src="src/js/eve_api.js"></script>

        <script type="text/javascript" src="src/js/character_sheet.js"></script>
        <script type="text/javascript" src="src/js/skill_browser.js"></script>
    </head>
    <body class="row">
        <div class="alpha danger">!! THIS IS IN ALPHA !!</div>
        <header>
            <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#">EVE Skill Plan</a>
                </div>
                <!-- Collect the nav links, forms, and other content for toggling -->
                <div class="collapse navbar-collapse navbar-ex1-collapse">
                    <ul class="nav navbar-nav">
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Characters <b class="caret"></b></a>
                            <ul class="dropdown-menu">
                                <li><a href="#">Action</a></li>
                                <li><a href="#">Another action</a></li>
                                <li><a href="#">Something else here</a></li>
                                <li><a href="#">Separated link</a></li>
                                <li><a href="#">One more separated link</a></li>
                            </ul>
                        </li>
                        <li><a data-toggle="modal" href="#api_model">Manage API Keys</a></li>
                    </ul>
                </div>
            </nav>
        </header>

        <article class="col-lg-5">
            <ul class="nav nav-tabs" id="characterTabs">
                <li class="active"><a href="#overview" data-toggle="tab">Overview</a></li>
                <li><a href="#skillQueue" data-toggle="tab">Skill Queue</a></li> 
                <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">Skill Plans <span class="caret"></span></a>
                    <ul class="dropdown-menu">
                        <li><a href="#planTestA" data-toggle="tab">Test A</a></li>
                        <li><a href="#planTestA" data-toggle="tab">Test B</a></li>
                        <li><a href="#planTestA" data-toggle="tab">Test C</a></li>
                        <li><a href="#planTestA" data-toggle="tab">Test D</a></li>
                    </ul>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane active" id="overview">
                    <div class="character_info">
                        <div class="logos">
                            <img class="character" src="http://image.eveonline.com/Character/1519722524_256.jpg" />
                            <img class="corporation" src="http://image.eveonline.com/Corporation/1063360566_128.png" />
                            <img class="alliance" src="http://image.eveonline.com/Alliance/1354830081_128.png" />
                        </div>
                        <dl>
                            <dt>Name</dt><dd>narthollis</dd>
                            <dt>Corporation</dt><dd>&lt;F3AR&gt; SUNDERING</dd>
                            <dt>Alliance</dt><dd>[CONDI] GoonSwarm Federation</dd>
                        </dl>
                    </div>
                </div>
                <div class="tab-pane" id="skillQueue"></div>
                <div class="tab-pane" id="planTestA"></div>
                <div class="tab-pane" id="planTestB"></div>
                <div class="tab-pane" id="planTestC"></div>
                <div class="tab-pane" id="planTestD"></div>
            </div>
        </article>

        <aside class="col-lg-7 tab-content">
            <ul class="nav nav-tabs" id="browserTabs">
                <li class="active"><a href="#skillTree" data-toggle="tab">Skills</a></li>
                <li><a href="#certificateTree" data-toggle="tab">Certificates</a></li>
                <li><a href="#itemBrowser" data-toggle="tab">Items</a></li>
                <li><a href="#shipBrowser" data-toggle="tab">Ships</a></li>
            </ul>
                <div class="row tab-pane active" id="skillTree">
                    <div class="col-md-4">
                        <ul class="nav nav-tree" id="skillTreeTree"></ul>
                    </div>
                    <div class="col-md-8">
                        <div id="skillPanel"></div>
                    </div>
                    <script type="text/javascript">$("#skillTreeTree").SkillBrowser($("#skillPanel"));</script>
                </div>
                <div class="row tab-pane" id="certificateTree">
                    <div class="col-md-3">Certificate Tree Here</div>
                    <div class="col-md-9">Details of Selected Certificate Here</div>
                </div>
                <div class="row tab-pane" id="itemBrowser">
                    <div class="col-md-3">Market Group Tree Here</div>
                    <div class="col-md-9">Details of Selected Item Here</div>
                </div>
                <div class="row tab-pane" id="shipBrowser">
                    <div class="col-md-3">Ship Group Tree Here</div>
                    <div class="col-md-9">Details of Selected Ship Here</div>
                </div>
        </aside>

        <!-- API Model -->
        <div class="modal fade" id="api_model" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <header class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Manage API Keys</h4>
                    </header>
                    <article class="modal-body">
                    </article>
                    <footer class="modal-footer">
                        <button type="button" class="btn btn-success pull-left" id="api_manage_new">Add new Key</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </footer>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
        <script type="text/javascript">$('#api_model').api_panel();</script>
    </body>
</html>

