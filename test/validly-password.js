define(
    ["validly-password"],
    function( Validly ){
        describe( "Validly.password", function(){
            var iv,password;

            beforeEach( function(){
                iv = new Validly();
                password = iv.password;
            });

            it( "should return an object", function(){
                password.should.be.a( 'object' );
            });

            describe( "#testStrength", function(){
                var spy = sinon.spy();

                beforeEach( function(){
                    sinon.spy( password, "strength" );
                });

                afterEach( function(){
                    password.strength.restore();
                });

                it( "should call the embedded strength test when nothing is passed", function(){
                    password.testStrength();

                    password.strength.should.have.been.calledOnce;
                });

                it( "should call the passed strength test if one is provided", function(){
                    password.testStrength( undefined, spy );

                    spy.should.have.been.calledOnce;
                });

                it( "should call the provided test with its own first parameter", function(){
                    var string = "thing";
                    password.testStrength( string, spy );

                    spy.should.have.been.calledWithExactly( string );
                });

                it( "should return the resolution of the strength test", function(){
                    var string = "thing";
                    password.testStrength().should.equal( 1 );
                    password.testStrength( string, function( string ){ return string; } ).should.equal( string );
                });
            });

            describe( "#addFilter", function(){
                afterEach( function(){
                    password.filters = [];
                });

                it( "should add an item to the filters array", function(){
                    password.addFilter( "item" );

                    password.filters.length.should.equal( 1 );
                });

                it( "should add an item to the end of the filters array", function(){
                    password.addFilter();
                    password.addFilter( "thing" );

                    password.filters[ password.filters.length - 1 ].should.equal( "thing" );
                });

                it( "should add functions to the filters array", function(){
                    password.addFilter();
                    password.addFilter( function(){ return true;} );

                    password.filters[ password.filters.length - 1 ].should.be.a( "function" );
                });
            });

            describe( "#resetFilters", function(){
                it( "should empty the list of filters", function(){
                    password.filters = [
                        "thing",
                        undefined,
                        function(){ return true; }
                    ];

                    password.filters.length.should.equal( 3 );
                    password.resetFilters();
                    password.filters.length.should.equal( 0 );
                });
            });

            describe( "#meetsMinimumFilters", function(){
                beforeEach( function(){
                    sinon.spy( password, "runFilters" );
                });

                afterEach( function(){
                    password.runFilters.restore();
                });

                it( "should make one call to #runFilters", function(){
                    password.meetsMinimumFilters();

                    password.runFilters.should.have.been.calledOnce;
                });

                it( "should call #runFilters with its own first parameter", function(){
                    var string = "It's a thing";

                    password.meetsMinimumFilters( string );

                    password.runFilters.should.have.been.calledWithExactly( string );
                });

                it( "should return a boolean", function(){
                    password.meetsMinimumFilters().should.be.a( "boolean" );
                    password.meetsMinimumFilters( "A", 2 ).should.be.a( "boolean" );
                    password.meetsMinimumFilters( undefined, 1 ).should.be.a( "boolean" );
                });
            });

            describe( "#runFilters", function(){
                afterEach(function(){
                    password.filters = [];
                });

                it( "should return an integer", function(){
                    var num = password.runFilters();

                    num.should.be.a( "number" );
                    parseInt( num ).should.equal( num );
                });

                it( "should return 0 when no filters are present", function(){
                    password.runFilters().should.equal( 0 );
                });

                it( "should return 1 when it passes one filter", function(){
                    password.addFilter( "lower" );
                    password.runFilters( "string" ).should.equal( 1 );
                });

                it( "should return the number of passed filters", function(){
                    password.addFilter( function( string ){ return false;} ); // filter always fails
                    password.addFilter( function( string ){ return true;} ); // filter always passes
                    password.addFilter( "upper" );
                    password.addFilter( "lower" );

                    password.runFilters( "STRING" ).should.equal( 2 );
                });
            });

            describe( "#getTestFromFilter", function(){
                it( "should return a RegExp", function(){
                    password.getTestFromFilter().should.be.a( "regexp" );
                });

                it( "should return the appropriate RegExp", function(){
                    password.getTestFromFilter().should.deep.equal( /[.]/ );
                    password.getTestFromFilter( "number" ).should.deep.equal( /[0-9]/ );
                    password.getTestFromFilter( "upper" ).should.deep.equal( /[A-Z]/ );
                });
            });
        });
    }
);
