<div>
	<div>
		<h1>Urban Space Occupancy Analysis</h1>
	</div>
	<div>	
		<h3>Overview</h3>
		<p>
		  This is a ECE Senior project on IoT and data analytics. The experiment intends to give an analytical synthesis of human behavior in a given space and time.
		  <br/>
		  The project holds 3 major stages.
		  <ol>
			<li><strong>Data Collection</strong>
				<p>
					The Sensor component - ( JAVA ) sits on an Application Server and listens to the Raspberry pi GPIO pins using the pi4j API. The sensor data is saved in to MongoDB. This data collectively provides an analytical representation of the data collected over a considerable period of time.
				</p>
				<ul>
					<li>Motion Sensor to Raspberry Pi</li>
					<li>MongoDB Data Storage</li>
				</ul><br/>
			</li>
			<li><strong>Data Analysis</strong><br/>
				<p>
					Map Reduce is an algorithm to process huge volumes of data. The entire data process in basically broken into 2 steps.<br/> 
					<strong>MAP Step</strong> - In this stage the data is grouped per day.<br/>
					<strong>Reduce Step</strong> - In this stage the value is summed for each day.<br/>
					The Map Reduce process is repeated for each of the sensors for the entire data base.					
					<div>
						<div>
							<span>
								For example let us consider the following set of data for a particular Sensor id : <strong>HALL_SENSOR</strong>
							</span>						
							<table>
								<thead>
									<tr>
										<th>#</th>
										<th>Sensor Id</th>
										<th>Day</th>
										<th>Time</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>1</td>
										<td>HALL_SENSOR</td>
										<td>Sunday</td>
										<td>12:20:000</td>
									</tr>
									<tr>
										<td>2</td>
										<td>HALL_SENSOR</td>
										<td>Sunday</td>
										<td>17:50:000</td>
									</tr>
									<tr>
										<td>3</td>
										<td>HALL_SENSOR</td>
										<td>Monday</td>
										<td>22:32:000</td>
									</tr>
									<tr>
										<td>4</td>
										<td>HALL_SENSOR</td>
										<td>Tuesday</td>
										<td>11:10:000</td>
									</tr>
									<tr>
										<td>5</td>
										<td>HALL_SENSOR</td>
										<td>Tuesday</td>
										<td>12:22:000</td>
									</tr>								
								</tbody>
							</table>
						</div>
						<!-- /.table-responsive -->
					</div>
					<div>
						<div>
							<div>
								<div>	
								<h3>
									Mapped Data - (Step 1)
								</h3>
								<table>
									<thead>
										<tr>
											<th>Day</th>
											<th>Value</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Sunday</td>
											<td>[1, 1]</td>
										</tr>
										<tr>
											<td>Monday</td>
											<td>[1]</td>
										</tr>
										<tr>
											<td>Tuesday</td>
											<td>[1, 1]</td>
										</tr>
									</tbody>
								</table>
								</div>
							</div>
							</div>	
							<div>
							<div>
								<div>	
								<h3>
									Reduced Data - (Step 2)
								</h3>								
								<table>
									<thead>
										<tr>
											<th>Day</th>
											<th>Value</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Sunday</td>
											<td>2</td>
										</tr>
										<tr>
											<td>Monday</td>
											<td>1</td>
										</tr>
										<tr>
											<td>Tuesday</td>
											<td>2</td>
										</tr>
									</tbody>
								</table>
								</div>
							</div>
						</div>
					</div>							
				</p>				
			</li>
			<li><strong>Web Based Display</strong></li>	
				<p>
					The UI is built on Bootstrap Framework, ANgular JS running on Node.JS. The Application has MongoDB based security management. The Processed data is presented in the form of 2 charts
				</p>
				<ul>
					<li>
						<strong>Daily View</strong>
						<p>
							Occupancy volume per day in a week. This is displayed for each of Sensors.
						</p>
					</li>		
				</ul>
		  </ol>	  
		</p>
		<h3>Hardware</h3>
		<p>
			<ul>
				<li>Motion Sensors (3)</li>
				<li>Raspberry Pi 3 - Model B (1)</li>
				<li>24 Volt Power Supply</li>
				<li>Network Cable </li>
				<li>Router</li>
				<li>PC</li>
			</ul>
		</p>
		<h3>Software</h3>
		<p>
			<ul>
				<li>Rasbian Ubuntu OS</li>
				<li>Java 7</li>
				<li>Eclipse IDE</li>
				<li>Tomcat Application Server 7</li>
				<li>Mongo DB</li>
				<li>MongoChef IDE</li>
				<li>NPM</li>
				<li>Node Js</li>
			</ul>
		</p>
	</div>
</div>
