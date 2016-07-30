<script src="<%= grunt.config('baseUrl') %>/js/quest.js"></script>

</head>
<body>
<div id="wrapper" class="container-fluid" >
	<div class="row">
		<div class="col-md-12">

			<div style="height:<%= meta.table_height %>px; overflow: auto;">
				<table class="table table-bordered table-striped table-fixed" id='list_quests'>
					<thead>
						<tr>
							<th>Quest ID</th>
							<th>Name</th>
							<th>Description</th>
							<th>Status</th>
							<th>Achievement ID</th>
							<th>Use Quest</th>
							<th>Quest ID</th>
							<th>Use Point</th>
							<th>Point Value</th>
							<th>Action</th>
							<th>Use Notification</th>
							<th>Message</th>
							<th>Edit</th>
							<th>Delete</th>
					</thead>
								
					<tbody>
						
					</tbody>

				</table>
			</div>
			<div class="container-fluid">
			     <button id="addnewquest" type="button" class="btn btn-success"><span class=" glyphicon glyphicon-plus"></button> 
			    <button id="refreshbutton" type="button" class="btn btn-info pull-right"> <span class=" glyphicon glyphicon-refresh"></button>
			</div>
		</div>
		<div class="col-md-0">
		</div>
	</div>
</div>

            <!-- /.container-fluid -->
<div class="modal fade" id="modalquestdiv" role="dialog">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
			    <button type="button" class="close" data-dismiss="modal">&times;</button>
			    <h4 class="modal-title"></h4>
			</div>
			<div class="modal-body">
				<form method="POST" enctype="multipart/form-data" data-toggle="validator" id="modalquestform" name="appId" class="form-horizontal" role="form">
				    <div class="form-group">
						<label class="col-sm-2 control-label">Quest ID:</label>
						<div class="col-sm-10">
							<input type="text" maxlength="20" class="form-control" id="quest_id" name="questid" placeholder="1" required>
						</div>
						
					</div>
					<div class="form-group">
						<label class="col-sm-2 control-label">Quest Name:</label>
						<div class="col-sm-10">
							<input type="text" maxlength="20" class="form-control" id="quest_name" name="questname" placeholder="The quest journey" required>
						</div>
					</div>
					<div class="form-group">
						<label class="col-sm-2 control-label">Quest Description:</label>
						<div class="col-sm-10">
							<textarea class="form-control" maxlength="100" rows="3" id="quest_desc" name="questdescription" placeholder="This is the achievement description"></textarea>
						</div>
					</div>
					<div class="form-group">
						<label class="col-sm-2 control-label">Achievement :</label>
						<div class="col-sm-10">
							<div class="input-group">
							    <input type="text" class="form-control" placeholder="Achievement ID" id="quest_achievement_id" name="questachievementid" required readonly>
							    <span class="input-group-btn">
								    <button class="btn btn-secondary" type="button" id="select_achievement" data-toggle="collapse" data-target="#panel_achievement" aria-expanded="false" aria-controls="panel_achievement">Select</button>
							    </span>
							</div>

						    <div class="collapse" id="panel_achievement">
						    	<table class="table table-bordered table-striped table-fixed" id='list_achievements_a'>
									<thead>
										<tr>
											<th>Achievement ID</th>
											<th>Achievement Name</th>
											<th>Achievement Description</th>
											<th>Point value</th>
											<th>Badge ID</th>
											<th>Select</th>
									</thead>
												
									<tbody>
										
									</tbody>

								</table> 
							</div>
						</div>
						</div>
					 <div class="form-group">
							<label class="col-sm-2 control-label">Status :</label>
							<div class="col-sm-5">
								 <div class="input-group">
								     	 <input type="text" class="form-control" aria-label="..."  id="quest_status_text" value="REVEALED" readonly>
								      <div class="input-group-btn">
								        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Select <span class="caret"></span></button>
								        <ul class="dropdown-menu dropdown-menu-right" id="quest_dropdown_status">
								          <li><a href="#revealed">REVEALED</a></li>
								          <li><a href="#hidden">HIDDEN</a></li>
								          <li><a href="#completed">COMPLETED</a></li>
								        </ul>
								      </div><!-- <input type="text" class="form-control" aria-label="...">/btn-group -->
								      </div>
						  	</div>
						</div> 
						<!-- Form group end -->
						<div class="form-group">
							<label class="col-sm-2 control-label"></label>
							<div class="col-sm-10">
								<p >
								  Constraint to change the quest status into REVEALED
								</p>
							</div>
						
							<label class="col-sm-2 control-label">Point :</label>
							<div class="col-sm-10">
							  	<div class="input-group">
								      <span class="input-group-addon">
								        <input type="checkbox" aria-label="..." id="quest_point_check">
								      </span>
								      <input type="number" class="form-control" id="quest_point_value" name="questpointvalue" value="0">
							    </div>
								<small class="text-muted">
								  The quest will be revealed after a player reached this point threshold
								</small>
							</div>
						</div>
						<div class="form-group">
							<label class="col-sm-2 control-label">Completed Quest :</label>
							<div class="col-sm-10">
					  			<div class="input-group">
					  				<span class="input-group-addon">
								        <input type="checkbox" aria-label="..." id="quest_quest_check">
								      </span>
					      			<input type="text" class="form-control" placeholder="Quest ID" id="quest_id_completed" name="questidcompleted" readonly>
					      
				    			</div>
				    			<div class="collapse" id="panel_quest_completed">
					    			<ul class="list-group" id="quest_completed_list">
									  
									</ul>
								</div>
								<small class="text-muted">
								  The quest will be revealed after a player completed this quest
								</small>
						  	</div>
						</div>
							<!-- Add remaining columns here -->
						<div class="form-group">
							<label class="col-sm-2 control-label">Actions :</label>
							<div class="col-sm-10">
							<ul class="list-group" id="quest_action_list_group">
							  
							</ul>
							<div class="input-group">
							    <span class="input-group-btn">
								    <button class="btn btn-primary btn-block" type="button" id="select_action" data-toggle="collapse" data-target="#panel_action" aria-expanded="false" aria-controls="panel_action">Show</button>
							    </span>
							</div>

						    <div class="collapse" id="panel_action">	
						    	<table class="table table-bordered table-striped table-fixed" id='list_actions_a'>
									<thead>
										<tr>
											<th>Action ID</th>
											<th>Times</th>
											<th>Select</th>
									</thead>
												
									<tbody>
										
									</tbody>

								</table>  
							    
							</div>
							</div>
						</div>
						<div class="form-group">								
							<label class="col-sm-2 control-label">Notification :</label>
							<div class="col-sm-10">
							  	<div class="input-group">
								      <span class="input-group-addon">
								        <input type="checkbox" aria-label="..." id="quest_notification_check" name="questnotificationcheck">
								      </span>
								      <input type="text" class="form-control" id="quest_notification_message" name="questnotificationmessage" placeholder="Notification Message">
							    </div>
							</div>
						</div>
						<div class="form-group">
					    	<div class="col-sm-offset-2 col-sm-10">
					        	<button id="modalquestsubmit" type="button" class="btn btn-primary" value="" ></button>
					    	</div>
						</div>
					</form>
			    </div>
			    <!-- <div class="modal-footer">
			        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
			    </div> -->
			</div>
		</div>
	</div>
<!-- Add Modal END -->
<div id="point-popover-content" class="hidden">
	<form>
    	<div class="form-group row">
		  <div class="col-sm-12">
		  <b>Point ID</b><p class="form-control-static" id="pointidpopover"></p>

		  </div>
		</div>
		<div class="form-group row">
		  <div class="col-sm-12">
				<b>Point Name</b><p class="form-control-static" id="pointnamepopover"></p>
		  </div>
		</div>
		<div class="form-group row">
		  <div class="col-sm-12">
				<b>Unit Name</b><p class="form-control-static" id="pointunitpopover"></p>
		  </div>
		</div>
	</form>
  </div>
<div id="badge-popover-content" class="hidden">
	<form>
    	<div class="form-group row">
		  <div class="col-sm-12">
		  <b>Badge ID</b> <p class="form-control-static" id="badgeidpopover"></p>

		  </div>
		</div>
		<div class="form-group row">
		  <div class="col-sm-12">
				<b>Badge Name</b> <p class="form-control-static" id="badgenamepopover"></p>
		  </div>
		</div>
		<div class="form-group row">
		  <div class="col-sm-12">
			<b>Description</b>	<p class="form-control-static" id="badgedescpopover"></p>
		  </div>
		</div>
		<div class="form-group row">
		  <div class="col-sm-12">
				<img class="badgeimagemini" id="badgeimagepopover" alt="your image" />
		  </div>
		</div>
	</form>
</div>
<div id="modalspinner" style="display: none">
    <div class="center">
        <img alt="" src="<%= grunt.config('baseUrl') %>/img/loader.svg" />
    </div>
</div>