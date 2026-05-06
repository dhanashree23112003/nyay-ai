import java.awt.*;
import javax.swing.*;

public class MyPanel extends JPanel{

 //Image image;
 
 MyPanel(){
  
  //image = new ImageIcon("sky.png").getImage();
  this.setPreferredSize(new Dimension(500,500));
 }
 
 public void paint(Graphics g) {
  
  Graphics2D g2D = (Graphics2D) g;
  
  //g2D.drawImage(image, 0, 0, null);
  
  g2D.setPaint(Color.blue);


  //Info 
  g2D.drawString("max capicity of car= 3",120,20);
  g2D.drawString("Trips::\n",120,40);
  g2D.drawString("1 4 2 ",120,50);
  g2D.drawString("2 6 1 ",120,60);
  g2D.drawString("8 11 3",120,70);





  

  //Lines for First Rectange
  g2D.setStroke(new BasicStroke(5));
  g2D.drawLine( 150, 250, 150, 200 );
  g2D.drawLine( 200, 250, 200, 200 );
  g2D.drawLine( 250, 250, 250, 200 );
  g2D.drawLine( 300, 250, 300, 200 );
  g2D.drawLine( 350, 250, 350, 200 );
  g2D.drawLine( 400, 250, 400, 200 );
  g2D.drawLine( 450, 250, 450, 200 );
  g2D.drawLine( 500, 250, 500, 200 );
  g2D.drawLine( 550, 250, 550, 200 );
  g2D.drawLine( 600, 250, 600, 200 );
  g2D.drawLine( 650, 250, 650, 200 );
  g2D.drawLine( 700, 250, 700, 200 );
  g2D.drawLine( 750, 250, 750, 200 );


//   Lines for Second Rectange
  g2D.drawLine( 150, 450, 150, 400 );
  g2D.drawLine( 200, 450, 200, 400 );
  g2D.drawLine( 250, 450, 250, 400 );
  g2D.drawLine( 300, 450, 300, 400 );
  g2D.drawLine( 350, 450, 350, 400 );
  g2D.drawLine( 400, 450, 400, 400 );
  g2D.drawLine( 450, 450, 450, 400 );
  g2D.drawLine( 500, 450, 500, 400 );
  g2D.drawLine( 550, 450, 550, 400 );
  g2D.drawLine( 600, 450, 600, 400 );
  g2D.drawLine( 650, 450, 650, 400 );
  g2D.drawLine( 700, 450, 700, 400 );
  g2D.drawLine( 750, 450, 750, 400 );


  //Numbers in Array
  g2D.drawString("0",120,230);
  g2D.drawString("2",180,230);
  g2D.drawString("1",230,230);
  g2D.drawString("0",280,230);
  g2D.drawString("-2",330,230);
  g2D.drawString("0",380,230);
  g2D.drawString("-1",430,230);
  g2D.drawString("0",480,230);
  g2D.drawString("3",530,230);
  g2D.drawString("0",580,230);
  g2D.drawString("0",630,230);
  g2D.drawString("-3",680,230);
  g2D.drawString("0",730,230);



//Numbers in 2nd Array
  g2D.drawString("0",120,430);
  g2D.drawString("2",180,430);
  g2D.drawString("3",230,430);
  g2D.drawString("3",280,430);
  g2D.drawString("1",330,430);
  g2D.drawString("1",380,430);
  g2D.drawString("0",430,430);
  g2D.drawString("0",480,430);
  g2D.drawString("3",530,430);
  g2D.drawString("3",580,430);
  g2D.drawString("3",630,430);
  g2D.drawString("0",680,430);
  g2D.drawString("0",730,430);



  //Index of first Array
  g2D.drawString("0",120,180);
  g2D.drawString("1",180,180);
  g2D.drawString("2",220,180);
  g2D.drawString("3",280,180);
  g2D.drawString("4",320,180);
  g2D.drawString("5",380,180);
  g2D.drawString("6",420,180);
  g2D.drawString("7",480,180);
  g2D.drawString("8",520,180);
  g2D.drawString("9",580,180);
  g2D.drawString("10",620,180);
  g2D.drawString("11",680,180);
  g2D.drawString("12",720,180);
//   g2D.drawString("2",780,180);



 //Index of Second Array
 g2D.drawString("0",120,380);
 g2D.drawString("1",180,380);
 g2D.drawString("2",220,380);
 g2D.drawString("3",280,380);
 g2D.drawString("4",320,380);
 g2D.drawString("5",380,380);
 g2D.drawString("6",420,380);
 g2D.drawString("7",480,380);
 g2D.drawString("8",520,380);
 g2D.drawString("9",580,380);
 g2D.drawString("10",620,380);
 g2D.drawString("11",680,380);
 g2D.drawString("12",720,380);
//   g2D.drawString("2",780,180);
  g2D.setPaint(Color.black);
  g2D.drawRect(100, 200, 650, 48);


  g2D.setPaint(Color.black);
  g2D.drawRect(100, 400, 650, 48);
//   g2D.fillRect(0, 0, 100, 200);
  
//   g2D.setPaint(Color.orange);
//   g2D.drawOval(0, 0, 100, 100);
//   g2D.fillOval(0, 0, 100, 100);
  
  //g2D.setPaint(Color.red);
  //g2D.drawArc(0, 0, 100, 100, 0, 180);
  //g2D.fillArc(0, 0, 100, 100, 0, 180);
  //g2D.setPaint(Color.white);
  //g2D.fillArc(0, 0, 100, 100, 180, 180);
  
  //int[] xPoints = {150,250,350};
  //int[] yPoints = {300,150,300};
  //g2D.setPaint(Color.yellow);
  //g2D.drawPolygon(xPoints, yPoints, 3);
  //g2D.fillPolygon(xPoints, yPoints, 3);
  
  //g2D.setPaint(Color.magenta);
  //g2D.setFont(new Font("Ink Free",Font.BOLD,50));
  //g2D.drawString("U R A WINNER! :D", 50, 50);  
 }
}